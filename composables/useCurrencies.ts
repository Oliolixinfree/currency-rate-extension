import { CURRENCIES_LIST } from '@/shared/constants'
import { Currency, Rate } from '@/shared/types'

export function useCurrencyRates() {
	const fetchedCurrencies = ref<Currency[]>([])
	const isLoadingCurrencies = ref(false)
	const errorCurrencies = ref<string | null>(null)

	const fetchedRates = ref<Rate[]>([])
	const isLoadingRates = ref(false)
	const errorRates = ref<string | null>(null)

	function getCountryCode(isoCode: string): string {
		return (
			CURRENCIES_LIST.find(
				c => c.isoCode === isoCode
			)?.countryCode.toLowerCase() ?? ''
		)
	}

	async function fetchCurrency(currency: string): Promise<Currency> {
		try {
			const res = await fetch(
				`https://api.frankfurter.dev/v2/currency/${currency}`
			)

			if (!res.ok) {
				throw new Error(`HTTP error: ${res.status}`)
			}

			return res.json()
		} catch (error) {
			console.error('Failed to fetch currency:', error)
			throw error
		}
	}

	async function fetchAllCurrencies() {
		isLoadingCurrencies.value = true
		errorCurrencies.value = null

		const results = await Promise.allSettled(
			CURRENCIES_LIST.map(c => fetchCurrency(c.isoCode))
		)

		fetchedCurrencies.value = results
			.filter(
				(r): r is PromiseFulfilledResult<Currency> => r.status === 'fulfilled'
			)
			.map(r => r.value)

		const failed = results.filter(r => r.status === 'rejected')
		if (failed.length) {
			console.error(`${failed.length} requests failed`)
		}
		isLoadingCurrencies.value = false
	}

	async function fetchRates(base: string): Promise<void> {
		isLoadingRates.value = true
		errorRates.value = null

		const quotes = CURRENCIES_LIST.filter(c => c.isoCode !== base)
			.map(c => c.isoCode)
			.join(',')

		try {
			const res = await fetch(
				`https://api.frankfurter.dev/v2/rates?base=${base}&quotes=${quotes}`
			)
			if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
			fetchedRates.value = await res.json()
		} catch (e) {
			console.error('Failed to fetch rates:', e)
			errorRates.value = 'Failed to load rates'
		} finally {
			isLoadingRates.value = false
		}
	}

	return {
		fetchedCurrencies,
		isLoadingCurrencies,
		errorCurrencies,
		fetchedRates,
		isLoadingRates,
		errorRates,
		getCountryCode,
		fetchAllCurrencies,
		fetchRates
	}
}
