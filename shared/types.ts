export type Currency = {
	iso_code: string
	iso_numeric: string
	name: string
	symbol: string
	start_date: string
	end_date: string
	providers: string[]
}

export type Rate = {
	date: string
	base: string
	quote: string
	rate: number
}
