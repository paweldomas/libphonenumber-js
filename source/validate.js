import parse, { is_viable_phone_number } from './parse'
import get_number_type, { sort_out_arguments } from './get number type'

import
{
	get_types
}
from './metadata'

// Checks if a given phone number is valid
//
// Example use cases:
//
// ```js
// is_valid('8005553535', 'RU')
// is_valid('8005553535', 'RU', metadata)
// is_valid({ phone: '8005553535', country: 'RU' })
// is_valid({ phone: '8005553535', country: 'RU' }, metadata)
// is_valid('+78005553535')
// is_valid('+78005553535', metadata)
// ```
//
export default function is_valid(first_argument, second_argument, third_argument)
{
	const { input, metadata } = sort_out_arguments(first_argument, second_argument, third_argument)

	// Sanity check
	if (!metadata)
	{
		throw new Error('Metadata not passed')
	}

	if (!input)
	{
		return false
	}

	if (!input.country)
	{
		return false
	}

	const country_metadata = metadata.countries[input.country]

	if (get_types(country_metadata))
	{
		if (!get_number_type(input, metadata))
		{
			return false
		}
	}

	return true
}