<script lang="ts" setup>
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput
} from '@/components/ui/input-group'
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-vue-next'
import ModeToggle from '@/components/ModeToggle.vue'
import { useCurrencyRates } from '@/composables/useCurrencies'
import { CURRENCIES_LIST } from '@/shared/constants'

const {
	fetchedCurrencies,
	isLoadingCurrencies,
	errorCurrencies,
	fetchedRates,
	isLoadingRates,
	errorRates,
	getCountryCode,
	fetchAllCurrencies,
	fetchRates
} = useCurrencyRates()

const selectedCurrency = ref('USD')
const amount = ref<number>(1)
const today = ref(new Date().toLocaleDateString('ru-RU'))

const selectedCurrencyData = computed(() =>
	fetchedCurrencies.value.find(c => c.iso_code === selectedCurrency.value)
)

const convertedRates = computed(() =>
	fetchedRates.value.map(rate => ({
		...rate,
		converted: (amount.value * rate.rate).toFixed(2)
	}))
)

async function refresh() {
	await fetchRates(selectedCurrency.value)
	today.value = new Date().toLocaleDateString('ru-RU')
}

onMounted(fetchAllCurrencies)

watch(selectedCurrency, fetchRates, { immediate: true })
</script>

<template>
	<div class="min-w-xl flex flex-col gap-4 w-full py-4 font-sans">
		<div class="px-4 flex items-center justify-between">
			<p class="text-xl">
				Today
				<span class="text-muted-foreground">{{ today }}</span>
			</p>
			<ModeToggle />
		</div>

		<div class="flex-1 px-4">
			<div class="flex items-center gap-2 mb-4">
				<InputGroup>
					<InputGroupInput
						v-model.number="amount"
						type="number"
						min="1"
						placeholder="Amount"
						class="font-mono"
					/>
					<InputGroupAddon>{{ selectedCurrencyData?.symbol }}</InputGroupAddon>
					<InputGroupAddon align="inline-end">
						{{ selectedCurrencyData?.iso_code }}
					</InputGroupAddon>
				</InputGroup>
				<Select v-model="selectedCurrency">
					<SelectTrigger class="w-[180px]">
						<img
							:src="`https://flagcdn.com/w20/${getCountryCode(selectedCurrency)}.webp`"
							:alt="selectedCurrency"
							class="w-5 h-4 rounded"
						/>
						<SelectValue placeholder="Select a currency" />
					</SelectTrigger>
					<SelectContent>
						<Spinner
							v-if="isLoadingCurrencies"
							class="mx-auto"
						/>
						<p
							v-else-if="errorCurrencies"
							class="text-destructive"
						>
							{{ errorCurrencies }}
						</p>
						<SelectItem
							v-else
							v-for="currency in fetchedCurrencies"
							:value="currency.iso_code"
						>
							<div class="flex items-center gap-2">
								<img
									:src="`https://flagcdn.com/w20/${getCountryCode(currency.iso_code)}.webp`"
									:alt="currency.iso_code"
									class="w-5 h-4 rounded"
								/>
								{{ currency.name }} {{ currency.symbol }}
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Pair</TableHead>
						<TableHead class="text-right">Rate</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					<template v-if="isLoadingRates">
						<TableRow
							v-for="(_, i) in Array.from({
								length: CURRENCIES_LIST.length - 1
							})"
							:key="i"
						>
							<TableCell colspan="2">
								<Skeleton class="h-[20px]" />
							</TableCell>
						</TableRow>
					</template>
					<TableRow v-else-if="errorRates">
						<TableCell
							colspan="2"
							class="text-destructive text-center"
						>
							{{ errorRates }}
						</TableCell>
					</TableRow>
					<TableRow
						v-else
						v-for="rate in convertedRates"
						:key="rate.quote"
					>
						<TableCell>
							<div class="flex items-center gap-1">
								<div class="flex items-center gap-1">
									<img
										:src="`https://flagcdn.com/w20/${getCountryCode(selectedCurrency)}.webp`"
										:alt="selectedCurrency"
										class="w-5 h-4 rounded"
									/>
									<span>{{ selectedCurrency }}</span>
								</div>
								<span class="text-muted-foreground">/</span>
								<div class="flex items-center gap-1">
									<img
										:src="`https://flagcdn.com/w20/${getCountryCode(rate.quote)}.webp`"
										:alt="rate.quote"
										class="w-5 h-4 rounded"
									/>
									<span>{{ rate.quote }}</span>
								</div>
							</div>
						</TableCell>
						<TableCell class="text-right font-mono">
							{{ rate.converted }}
						</TableCell>
					</TableRow>
				</TableBody>
				<TableFooter>
					<TableRow>
						<TableCell
							class="text-right"
							colspan="2"
						>
							<Button
								variant="outline"
								size="sm"
								:disabled="isLoadingRates"
								@click="refresh"
							>
								<RefreshCw :class="{ 'animate-spin': isLoadingRates }" />
								Refresh rates
							</Button>
						</TableCell>
					</TableRow>
				</TableFooter>
			</Table>
		</div>
	</div>
</template>
