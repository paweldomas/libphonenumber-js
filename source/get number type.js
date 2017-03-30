import parse, { is_viable_phone_number } from './parse'

import { matches_entirely } from './common'

import
{
	get_national_number_pattern,
	get_type_fixed_line,
	get_type_mobile,
	get_type_toll_free,
	get_type_premium_rate,
	get_type_personal_number,
	get_type_voice_mail,
	get_type_uan,
	get_type_pager,
	get_type_voip,
	get_type_shared_cost
}
from './metadata'

// Finds out national phone number type (fixed line, mobile, etc)
export default function get_number_type(first_argument, second_argument, third_argument)
{
	const { input, metadata } = sort_out_arguments(first_argument, second_argument, third_argument)

	// Sanity check
	if (!metadata)
	{
		throw new Error('Metadata not passed')
	}

	// When no input was passed
	if (!input)
	{
		return
	}

	// When `parse()` returned `{}`
	// meaning that the phone number is not a valid one.
	if (!input.country)
	{
		return
	}

	const national_number = input.phone
	const country_metadata = metadata.countries[input.country]

	// Is this national number even valid for this country
	if (!is_of_type(national_number, get_national_number_pattern(country_metadata)))
	{
		return
	}

	if (is_of_type(national_number, get_type_mobile(country_metadata)))
	{
		// Because duplicate regular expressions are removed
		// to reduce metadata size, if there's no "fixed line" pattern
		// then it means it was removed due to being a duplicate of some other pattern.
		//
		// Also, many times fixed line phone number regular expressions
		// are the same as mobile phone number regular expressions,
		// so in these cases there's no differentiation between them.
		//
		// (no such country in the metadata, therefore no unit test for this `if`)
		/* istanbul ignore if */
		if (!get_type_fixed_line(country_metadata) || get_type_fixed_line(country_metadata) === get_type_mobile(country_metadata))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		return 'MOBILE'
	}

	// Is it fixed line number
	if (is_of_type(national_number, get_type_fixed_line(country_metadata)))
	{
		// Because duplicate regular expressions are removed
		// to reduce metadata size, if there's no "mobile" pattern
		// then it means it was removed due to being a duplicate of some other pattern.
		//
		// Also, many times fixed line phone number regular expressions
		// are the same as mobile phone number regular expressions,
		// so in these cases there's no differentiation between them.
		//
		if (!get_type_mobile(country_metadata) || get_type_mobile(country_metadata) === get_type_fixed_line(country_metadata))
		{
			return 'FIXED_LINE_OR_MOBILE'
		}

		return 'FIXED_LINE'
	}

	if (is_of_type(national_number, get_type_toll_free(country_metadata)))
	{
		return 'TOLL_FREE'
	}

	if (is_of_type(national_number, get_type_premium_rate(country_metadata)))
	{
		return 'PREMIUM_RATE'
	}

	if (is_of_type(national_number, get_type_personal_number(country_metadata)))
	{
		return 'PERSONAL_NUMBER'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_voice_mail(country_metadata)))
	{
		return 'VOICEMAIL'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_uan(country_metadata)))
	{
		return 'UAN'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_pager(country_metadata)))
	{
		return 'PAGER'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_voip(country_metadata)))
	{
		return 'VOIP'
	}

	/* istanbul ignore if */
	if (is_of_type(national_number, get_type_shared_cost(country_metadata)))
	{
		return 'SHARED_COST'
	}
}

export function is_of_type(national_number, type)
{
	// // Check if any possible number lengths are present;
	// // if so, we use them to avoid checking
	// // the validation pattern if they don't match.
	// // If they are absent, this means they match
	// // the general description, which we have
	// // already checked before a specific number type.
	// if (get_possible_lengths(type) &&
	// 	get_possible_lengths(type).indexOf(national_number.length) === -1)
	// {
	// 	return false
	// }

	// get_type_pattern(type) === type
	return matches_entirely(national_number, type)
}

// Sort out arguments
export function sort_out_arguments(first_argument, second_argument, third_argument)
{
	let input
	let metadata

	if (typeof first_argument === 'string')
	{
		// If country code is supplied
		if (typeof second_argument === 'string')
		{
			metadata = third_argument

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `is_viable_phone_number` check.
			if (is_viable_phone_number(first_argument))
			{
				input = parse(first_argument, second_argument, metadata)
			}
		}
		// Just an international phone number is supplied
		else
		{
			metadata = second_argument

			// `parse` extracts phone numbers from raw text,
			// therefore it will cut off all "garbage" characters,
			// while this `validate` function needs to verify
			// that the phone number contains no "garbage"
			// therefore the explicit `is_viable_phone_number` check.
			if (is_viable_phone_number(first_argument))
			{
				input = parse(first_argument, metadata)
			}
		}
	}
	else
	{
		// The `first_argument` must be a valid phone number
		// as a whole, not just a part of it which gets parsed here.
		if (first_argument && first_argument.phone && is_viable_phone_number(first_argument.phone))
		{
			input = first_argument
		}

		metadata = second_argument
	}

	return { input, metadata }
}