const countries = [
	{
		name: "Earth",
		flag: "🌍",
		region: "The Universe",
		code: "EARTH",
	},
	{
		name: "Andorra",
		flag: "🇦🇩",
		region: "Europe",
		code: "AD",
	},
	{
		name: "Afghanistan",
		flag: "🇦🇫",
		region: "Asia & Pacific",
		code: "AF",
	},
	{
		name: "Antigua and Barbuda",
		flag: "🇦🇬",
		region: "South/Latin America",
		code: "AG",
	},
	{
		name: "Anguilla",
		flag: "🇦🇮",
		region: "South/Latin America",
		code: "AI",
	},
	{
		name: "Albania",
		flag: "🇦🇱",
		region: "Europe",
		code: "AL",
	},
	{
		name: "Armenia",
		flag: "🇦🇲",
		region: "Europe",
		code: "AM",
	},
	{
		name: "Angola",
		flag: "🇦🇴",
		region: "Africa",
		code: "AO",
	},
	{
		name: "Antarctica",
		flag: "🇦🇶",
		region: "Asia & Pacific",
		code: "AQ",
	},
	{
		name: "Argentina",
		flag: "🇦🇷",
		region: "South/Latin America",
		code: "AR",
	},
	{
		name: "American Samoa",
		flag: "🇦🇸",
		region: "Asia & Pacific",
		code: "AS",
	},
	{
		name: "Austria",
		flag: "🇦🇹",
		region: "Europe",
		code: "AT",
	},
	{
		name: "Australia",
		flag: "🇦🇺",
		region: "Asia & Pacific",
		code: "AU",
	},
	{
		name: "Aruba",
		flag: "🇦🇼",
		region: "South/Latin America",
		code: "AW",
	},
	{
		name: "Åland Islands",
		flag: "🇦🇽",
		region: "Europe",
		code: "AX",
	},
	{
		name: "Azerbaijan",
		flag: "🇦🇿",
		region: "Asia & Pacific",
		code: "AZ",
	},
	{
		name: "Bosnia and Herzegovina",
		flag: "🇧🇦",
		region: "Europe",
		code: "BA",
	},
	{
		name: "Barbados",
		flag: "🇧🇧",
		region: "South/Latin America",
		code: "BB",
	},
	{
		name: "Bangladesh",
		flag: "🇧🇩",
		region: "Asia & Pacific",
		code: "BD",
	},
	{
		name: "Belgium",
		flag: "🇧🇪",
		region: "Europe",
		code: "BE",
	},
	{
		name: "Burkina Faso",
		flag: "🇧🇫",
		region: "Africa",
		code: "BF",
	},
	{
		name: "Bulgaria",
		flag: "🇧🇬",
		region: "Europe",
		code: "BG",
	},
	{
		name: "Bahrain",
		flag: "🇧🇭",
		region: "Arab States",
		code: "BH",
	},
	{
		name: "Burundi",
		flag: "🇧🇮",
		region: "Africa",
		code: "BI",
	},
	{
		name: "Benin",
		flag: "🇧🇯",
		region: "Africa",
		code: "BJ",
	},
	{
		name: "Saint Barthélemy",
		flag: "🇧🇱",
		region: "South/Latin America",
		code: "BL",
	},
	{
		name: "Bermuda",
		flag: "🇧🇲",
		region: "North America",
		code: "BM",
	},
	{
		name: "Brunei Darussalam",
		flag: "🇧🇳",
		region: "Asia & Pacific",
		code: "BN",
	},
	{
		name: "Bolivia (Plurinational State of)",
		flag: "🇧🇴",
		region: "South/Latin America",
		code: "BO",
	},
	{
		name: "Bonaire, Sint Eustatius and Saba",
		flag: "🇧🇶",
		region: "Unknown",
		code: "BQ",
	},
	{
		name: "Brazil",
		flag: "🇧🇷",
		region: "South/Latin America",
		code: "BR",
	},
	{
		name: "Bhutan",
		flag: "🇧🇹",
		region: "Asia & Pacific",
		code: "BT",
	},
	{
		name: "Bouvet Island",
		flag: "🇧🇻",
		region: "South/Latin America",
		code: "BV",
	},
	{
		name: "Botswana",
		flag: "🇧🇼",
		region: "Africa",
		code: "BW",
	},
	{
		name: "Belarus",
		flag: "🇧🇾",
		region: "Europe",
		code: "BY",
	},
	{
		name: "Belize",
		flag: "🇧🇿",
		region: "South/Latin America",
		code: "BZ",
	},
	{
		name: "Canada",
		flag: "🇨🇦",
		region: "North America",
		code: "CA",
	},
	{
		name: "Switzerland",
		flag: "🇨🇭",
		region: "Europe",
		code: "CH",
	},
	{
		name: "Côte d'Ivoire",
		flag: "🇨🇮",
		region: "Africa",
		code: "CI",
	},
	{
		name: "Chile",
		flag: "🇨🇱",
		region: "South/Latin America",
		code: "CL",
	},
	{
		name: "Cameroon",
		flag: "🇨🇲",
		region: "Africa",
		code: "CM",
	},
	{
		name: "China",
		flag: "🇨🇳",
		region: "Asia & Pacific",
		code: "CN",
	},
	{
		name: "Colombia",
		flag: "🇨🇴",
		region: "South/Latin America",
		code: "CO",
	},
	{
		name: "Costa Rica",
		flag: "🇨🇷",
		region: "South/Latin America",
		code: "CR",
	},
	{
		name: "Cuba",
		flag: "🇨🇺",
		region: "South/Latin America",
		code: "CU",
	},
	{
		name: "Cabo Verde",
		flag: "🇨🇻",
		region: "Africa",
		code: "CV",
	},
	{
		name: "Curaçao",
		flag: "🇨🇼",
		region: "Unknown",
		code: "CW",
	},
	{
		name: "Christmas Island",
		flag: "🇨🇽",
		region: "Asia & Pacific",
		code: "CX",
	},
	{
		name: "Cyprus",
		flag: "🇨🇾",
		region: "Europe",
		code: "CY",
	},
	{
		name: "Germany",
		flag: "🇩🇪",
		region: "Europe",
		code: "DE",
	},
	{
		name: "Djibouti",
		flag: "🇩🇯",
		region: "Arab States",
		code: "DJ",
	},
	{
		name: "Denmark",
		flag: "🇩🇰",
		region: "Europe",
		code: "DK",
	},
	{
		name: "Dominica",
		flag: "🇩🇲",
		region: "South/Latin America",
		code: "DM",
	},
	{
		name: "Algeria",
		flag: "🇩🇿",
		region: "Arab States",
		code: "DZ",
	},
	{
		name: "Ecuador",
		flag: "🇪🇨",
		region: "South/Latin America",
		code: "EC",
	},
	{
		name: "Estonia",
		flag: "🇪🇪",
		region: "Europe",
		code: "EE",
	},
	{
		name: "Egypt",
		flag: "🇪🇬",
		region: "Arab States",
		code: "EG",
	},
	{
		name: "Western Sahara",
		flag: "🇪🇭",
		region: "Africa",
		code: "EH",
	},
	{
		name: "Eritrea",
		flag: "🇪🇷",
		region: "Africa",
		code: "ER",
	},
	{
		name: "Spain",
		flag: "🇪🇸",
		region: "Europe",
		code: "ES",
	},
	{
		name: "Ethiopia",
		flag: "🇪🇹",
		region: "Africa",
		code: "ET",
	},
	{
		name: "Finland",
		flag: "🇫🇮",
		region: "Europe",
		code: "FI",
	},
	{
		name: "Fiji",
		flag: "🇫🇯",
		region: "Asia & Pacific",
		code: "FJ",
	},
	{
		name: "Micronesia (Federated States of)",
		flag: "🇫🇲",
		region: "Asia & Pacific",
		code: "FM",
	},
	{
		name: "France",
		flag: "🇫🇷",
		region: "Europe",
		code: "FR",
	},
	{
		name: "Gabon",
		flag: "🇬🇦",
		region: "Africa",
		code: "GA",
	},
	{
		name: "Grenada",
		flag: "🇬🇩",
		region: "South/Latin America",
		code: "GD",
	},
	{
		name: "Georgia",
		flag: "🇬🇪",
		region: "Europe",
		code: "GE",
	},
	{
		name: "French Guiana",
		flag: "🇬🇫",
		region: "South/Latin America",
		code: "GF",
	},
	{
		name: "Guernsey",
		flag: "🇬🇬",
		region: "Europe",
		code: "GG",
	},
	{
		name: "Ghana",
		flag: "🇬🇭",
		region: "Africa",
		code: "GH",
	},
	{
		name: "Gibraltar",
		flag: "🇬🇮",
		region: "Europe",
		code: "GI",
	},
	{
		name: "Greenland",
		flag: "🇬🇱",
		region: "Europe",
		code: "GL",
	},
	{
		name: "Guinea",
		flag: "🇬🇳",
		region: "Africa",
		code: "GN",
	},
	{
		name: "Guadeloupe",
		flag: "🇬🇵",
		region: "South/Latin America",
		code: "GP",
	},
	{
		name: "Equatorial Guinea",
		flag: "🇬🇶",
		region: "Africa",
		code: "GQ",
	},
	{
		name: "Greece",
		flag: "🇬🇷",
		region: "Europe",
		code: "GR",
	},
	{
		name: "South Georgia and the South Sandwich Islands",
		flag: "🇬🇸",
		region: "South/Latin America",
		code: "GS",
	},
	{
		name: "Guatemala",
		flag: "🇬🇹",
		region: "South/Latin America",
		code: "GT",
	},
	{
		name: "Guam",
		flag: "🇬🇺",
		region: "Asia & Pacific",
		code: "GU",
	},
	{
		name: "Guinea-Bissau",
		flag: "🇬🇼",
		region: "Africa",
		code: "GW",
	},
	{
		name: "Guyana",
		flag: "🇬🇾",
		region: "South/Latin America",
		code: "GY",
	},
	{
		name: "Hong Kong",
		flag: "🇭🇰",
		region: "Asia & Pacific",
		code: "HK",
	},
	{
		name: "Honduras",
		flag: "🇭🇳",
		region: "South/Latin America",
		code: "HN",
	},
	{
		name: "Croatia",
		flag: "🇭🇷",
		region: "Europe",
		code: "HR",
	},
	{
		name: "Haiti",
		flag: "🇭🇹",
		region: "South/Latin America",
		code: "HT",
	},
	{
		name: "Hungary",
		flag: "🇭🇺",
		region: "Europe",
		code: "HU",
	},
	{
		name: "Indonesia",
		flag: "🇮🇩",
		region: "Asia & Pacific",
		code: "ID",
	},
	{
		name: "Ireland",
		flag: "🇮🇪",
		region: "Europe",
		code: "IE",
	},
	{
		name: "Israel",
		flag: "🇮🇱",
		region: "Europe",
		code: "IL",
	},
	{
		name: "Isle of Man",
		flag: "🇮🇲",
		region: "Europe",
		code: "IM",
	},
	{
		name: "India",
		flag: "🇮🇳",
		region: "Asia & Pacific",
		code: "IN",
	},
	{
		name: "Iraq",
		flag: "🇮🇶",
		region: "Arab States",
		code: "IQ",
	},
	{
		name: "Iran (Islamic Republic of)",
		flag: "🇮🇷",
		region: "Asia & Pacific",
		code: "IR",
	},
	{
		name: "Iceland",
		flag: "🇮🇸",
		region: "Europe",
		code: "IS",
	},
	{
		name: "Italy",
		flag: "🇮🇹",
		region: "Europe",
		code: "IT",
	},
	{
		name: "Jersey",
		flag: "🇯🇪",
		region: "Europe",
		code: "JE",
	},
	{
		name: "Jamaica",
		flag: "🇯🇲",
		region: "South/Latin America",
		code: "JM",
	},
	{
		name: "Jordan",
		flag: "🇯🇴",
		region: "Arab States",
		code: "JO",
	},
	{
		name: "Japan",
		flag: "🇯🇵",
		region: "Asia & Pacific",
		code: "JP",
	},
	{
		name: "Kenya",
		flag: "🇰🇪",
		region: "Africa",
		code: "KE",
	},
	{
		name: "Kyrgyzstan",
		flag: "🇰🇬",
		region: "Asia & Pacific",
		code: "KG",
	},
	{
		name: "Cambodia",
		flag: "🇰🇭",
		region: "Asia & Pacific",
		code: "KH",
	},
	{
		name: "North Korea",
		flag: "🇰🇵",
		region: "Asia",
		code: "KP",
	},
	{
		name: "South Korea",
		flag: "🇰🇷",
		region: "Asia",
		code: "KR",
	},
	{
		name: "Kiribati",
		flag: "🇰🇮",
		region: "Asia & Pacific",
		code: "KI",
	},
	{
		name: "Saint Kitts and Nevis",
		flag: "🇰🇳",
		region: "South/Latin America",
		code: "KN",
	},
	{
		name: "Kuwait",
		flag: "🇰🇼",
		region: "Arab States",
		code: "KW",
	},
	{
		name: "Kazakhstan",
		flag: "🇰🇿",
		region: "Asia & Pacific",
		code: "KZ",
	},
	{
		name: "Lebanon",
		flag: "🇱🇧",
		region: "Arab States",
		code: "LB",
	},
	{
		name: "Saint Lucia",
		flag: "🇱🇨",
		region: "South/Latin America",
		code: "LC",
	},
	{
		name: "Liechtenstein",
		flag: "🇱🇮",
		region: "Europe",
		code: "LI",
	},
	{
		name: "Sri Lanka",
		flag: "🇱🇰",
		region: "Asia & Pacific",
		code: "LK",
	},
	{
		name: "Liberia",
		flag: "🇱🇷",
		region: "Africa",
		code: "LR",
	},
	{
		name: "Lesotho",
		flag: "🇱🇸",
		region: "Africa",
		code: "LS",
	},
	{
		name: "Lithuania",
		flag: "🇱🇹",
		region: "Europe",
		code: "LT",
	},
	{
		name: "Luxembourg",
		flag: "🇱🇺",
		region: "Europe",
		code: "LU",
	},
	{
		name: "Latvia",
		flag: "🇱🇻",
		region: "Europe",
		code: "LV",
	},
	{
		name: "Libya",
		flag: "🇱🇾",
		region: "Arab States",
		code: "LY",
	},
	{
		name: "Morocco",
		flag: "🇲🇦",
		region: "Arab States",
		code: "MA",
	},
	{
		name: "Monaco",
		flag: "🇲🇨",
		region: "Europe",
		code: "MC",
	},
	{
		name: "Montenegro",
		flag: "🇲🇪",
		region: "Europe",
		code: "ME",
	},
	{
		name: "Saint Martin (French part)",
		flag: "🇲🇫",
		region: "South/Latin America",
		code: "MF",
	},
	{
		name: "Madagascar",
		flag: "🇲🇬",
		region: "Africa",
		code: "MG",
	},
	{
		name: "Mali",
		flag: "🇲🇱",
		region: "Africa",
		code: "ML",
	},
	{
		name: "Myanmar",
		flag: "🇲🇲",
		region: "Asia & Pacific",
		code: "MM",
	},
	{
		name: "Mongolia",
		flag: "🇲🇳",
		region: "Asia & Pacific",
		code: "MN",
	},
	{
		name: "Macao",
		flag: "🇲🇴",
		region: "Asia & Pacific",
		code: "MO",
	},
	{
		name: "Martinique",
		flag: "🇲🇶",
		region: "South/Latin America",
		code: "MQ",
	},
	{
		name: "Mauritania",
		flag: "🇲🇷",
		region: "Arab States",
		code: "MR",
	},
	{
		name: "Montserrat",
		flag: "🇲🇸",
		region: "South/Latin America",
		code: "MS",
	},
	{
		name: "Malta",
		flag: "🇲🇹",
		region: "Europe",
		code: "MT",
	},
	{
		name: "Mauritius",
		flag: "🇲🇺",
		region: "Africa",
		code: "MU",
	},
	{
		name: "Maldives",
		flag: "🇲🇻",
		region: "Asia & Pacific",
		code: "MV",
	},
	{
		name: "Malawi",
		flag: "🇲🇼",
		region: "Africa",
		code: "MW",
	},
	{
		name: "Mexico",
		flag: "🇲🇽",
		region: "South/Latin America",
		code: "MX",
	},
	{
		name: "Malaysia",
		flag: "🇲🇾",
		region: "Asia & Pacific",
		code: "MY",
	},
	{
		name: "Mozambique",
		flag: "🇲🇿",
		region: "Africa",
		code: "MZ",
	},
	{
		name: "Namibia",
		flag: "🇳🇦",
		region: "Africa",
		code: "NA",
	},
	{
		name: "New Caledonia",
		flag: "🇳🇨",
		region: "Asia & Pacific",
		code: "NC",
	},
	{
		name: "Norfolk Island",
		flag: "🇳🇫",
		region: "Asia & Pacific",
		code: "NF",
	},
	{
		name: "Nigeria",
		flag: "🇳🇬",
		region: "Africa",
		code: "NG",
	},
	{
		name: "Nicaragua",
		flag: "🇳🇮",
		region: "South/Latin America",
		code: "NI",
	},
	{
		name: "Norway",
		flag: "🇳🇴",
		region: "Europe",
		code: "NO",
	},
	{
		name: "Nepal",
		flag: "🇳🇵",
		region: "Asia & Pacific",
		code: "NP",
	},
	{
		name: "Nauru",
		flag: "🇳🇷",
		region: "Asia & Pacific",
		code: "NR",
	},
	{
		name: "Niue",
		flag: "🇳🇺",
		region: "Asia & Pacific",
		code: "NU",
	},
	{
		name: "New Zealand",
		flag: "🇳🇿",
		region: "Asia & Pacific",
		code: "NZ",
	},
	{
		name: "Oman",
		flag: "🇴🇲",
		region: "Arab States",
		code: "OM",
	},
	{
		name: "Panama",
		flag: "🇵🇦",
		region: "South/Latin America",
		code: "PA",
	},
	{
		name: "Peru",
		flag: "🇵🇪",
		region: "South/Latin America",
		code: "PE",
	},
	{
		name: "French Polynesia",
		flag: "🇵🇫",
		region: "Asia & Pacific",
		code: "PF",
	},
	{
		name: "Papua New Guinea",
		flag: "🇵🇬",
		region: "Asia & Pacific",
		code: "PG",
	},
	{
		name: "Pakistan",
		flag: "🇵🇰",
		region: "Asia & Pacific",
		code: "PK",
	},
	{
		name: "Poland",
		flag: "🇵🇱",
		region: "Europe",
		code: "PL",
	},
	{
		name: "Saint Pierre and Miquelon",
		flag: "🇵🇲",
		region: "North America",
		code: "PM",
	},
	{
		name: "Pitcairn",
		flag: "🇵🇳",
		region: "Asia & Pacific",
		code: "PN",
	},
	{
		name: "Puerto Rico",
		flag: "🇵🇷",
		region: "South/Latin America",
		code: "PR",
	},
	{
		name: "Palestine, State of",
		flag: "🇵🇸",
		region: "Arab States",
		code: "PS",
	},
	{
		name: "Portugal",
		flag: "🇵🇹",
		region: "Europe",
		code: "PT",
	},
	{
		name: "Palau",
		flag: "🇵🇼",
		region: "Asia & Pacific",
		code: "PW",
	},
	{
		name: "Paraguay",
		flag: "🇵🇾",
		region: "South/Latin America",
		code: "PY",
	},
	{
		name: "Qatar",
		flag: "🇶🇦",
		region: "Arab States",
		code: "QA",
	},
	{
		name: "Réunion",
		flag: "🇷🇪",
		region: "Asia & Pacific",
		code: "RE",
	},
	{
		name: "Romania",
		flag: "🇷🇴",
		region: "Europe",
		code: "RO",
	},
	{
		name: "Serbia",
		flag: "🇷🇸",
		region: "Europe",
		code: "RS",
	},
	{
		name: "Russia",
		flag: "🇷🇺",
		region: "Europe",
		code: "RU",
	},
	{
		name: "Rwanda",
		flag: "🇷🇼",
		region: "Africa",
		code: "RW",
	},
	{
		name: "Saudi Arabia",
		flag: "🇸🇦",
		region: "Arab States",
		code: "SA",
	},
	{
		name: "Solomon Islands",
		flag: "🇸🇧",
		region: "Asia & Pacific",
		code: "SB",
	},
	{
		name: "Seychelles",
		flag: "🇸🇨",
		region: "Africa",
		code: "SC",
	},
	{
		name: "Sweden",
		flag: "🇸🇪",
		region: "Europe",
		code: "SE",
	},
	{
		name: "Singapore",
		flag: "🇸🇬",
		region: "Asia & Pacific",
		code: "SG",
	},
	{
		name: "Saint Helena, Ascension and Tristan da Cunha",
		flag: "🇸🇭",
		region: "Africa",
		code: "SH",
	},
	{
		name: "Slovenia",
		flag: "🇸🇮",
		region: "Europe",
		code: "SI",
	},
	{
		name: "Svalbard and Jan Mayen",
		flag: "🇸🇯",
		region: "Europe",
		code: "SJ",
	},
	{
		name: "Slovakia",
		flag: "🇸🇰",
		region: "Europe",
		code: "SK",
	},
	{
		name: "Sierra Leone",
		flag: "🇸🇱",
		region: "Africa",
		code: "SL",
	},
	{
		name: "San Marino",
		flag: "🇸🇲",
		region: "Europe",
		code: "SM",
	},
	{
		name: "Senegal",
		flag: "🇸🇳",
		region: "Africa",
		code: "SN",
	},
	{
		name: "Somalia",
		flag: "🇸🇴",
		region: "Arab States",
		code: "SO",
	},
	{
		name: "Suriname",
		flag: "🇸🇷",
		region: "South/Latin America",
		code: "SR",
	},
	{
		name: "South Sudan",
		flag: "🇸🇸",
		region: "Africa",
		code: "SS",
	},
	{
		name: "Sao Tome and Principe",
		flag: "🇸🇹",
		region: "Africa",
		code: "ST",
	},
	{
		name: "El Salvador",
		flag: "🇸🇻",
		region: "South/Latin America",
		code: "SV",
	},
	{
		name: "Sint Maarten (Dutch part)",
		flag: "🇸🇽",
		region: "Unknown",
		code: "SX",
	},
	{
		name: "Syrian Arab Republic",
		flag: "🇸🇾",
		region: "Asia & Pacific",
		code: "SY",
	},
	{
		name: "Chad",
		flag: "🇹🇩",
		region: "Africa",
		code: "TD",
	},
	{
		name: "Togo",
		flag: "🇹🇬",
		region: "Africa",
		code: "TG",
	},
	{
		name: "Thailand",
		flag: "🇹🇭",
		region: "Asia & Pacific",
		code: "TH",
	},
	{
		name: "Tajikistan",
		flag: "🇹🇯",
		region: "Asia & Pacific",
		code: "TJ",
	},
	{
		name: "Tokelau",
		flag: "🇹🇰",
		region: "Asia & Pacific",
		code: "TK",
	},
	{
		name: "Timor-Leste",
		flag: "🇹🇱",
		region: "Asia & Pacific",
		code: "TL",
	},
	{
		name: "Turkmenistan",
		flag: "🇹🇲",
		region: "Asia & Pacific",
		code: "TM",
	},
	{
		name: "Tunisia",
		flag: "🇹🇳",
		region: "Arab States",
		code: "TN",
	},
	{
		name: "Tonga",
		flag: "🇹🇴",
		region: "Asia & Pacific",
		code: "TO",
	},
	{
		name: "Turkey",
		flag: "🇹🇷",
		region: "Europe",
		code: "TR",
	},
	{
		name: "Trinidad and Tobago",
		flag: "🇹🇹",
		region: "South/Latin America",
		code: "TT",
	},
	{
		name: "Tuvalu",
		flag: "🇹🇻",
		region: "Asia & Pacific",
		code: "TV",
	},
	{
		name: "United Republic of Tanzania",
		flag: "🇹🇿",
		region: "Africa",
		code: "TZ",
	},
	{
		name: "Ukraine",
		flag: "🇺🇦",
		region: "Europe",
		code: "UA",
	},
	{
		name: "Uganda",
		flag: "🇺🇬",
		region: "Africa",
		code: "UG",
	},
	{
		name: "United States of America",
		flag: "🇺🇸",
		region: "North America",
		code: "US",
	},
	{
		name: "Uruguay",
		flag: "🇺🇾",
		region: "South/Latin America",
		code: "UY",
	},
	{
		name: "Uzbekistan",
		flag: "🇺🇿",
		region: "Asia & Pacific",
		code: "UZ",
	},
	{
		name: "Saint Vincent and the Grenadines",
		flag: "🇻🇨",
		region: "South/Latin America",
		code: "VC",
	},
	{
		name: "Venezuela (Bolivarian Republic of)",
		flag: "🇻🇪",
		region: "South/Latin America",
		code: "VE",
	},
	{
		name: "Virgin Islands (British)",
		flag: "🇻🇬",
		region: "South/Latin America",
		code: "VG",
	},
	{
		name: "Virgin Islands (U.S.)",
		flag: "🇻🇮",
		region: "South/Latin America",
		code: "VI",
	},
	{
		name: "Vietnam",
		flag: "🇻🇳",
		region: "Asia & Pacific",
		code: "VN",
	},
	{
		name: "Vanuatu",
		flag: "🇻🇺",
		region: "Asia & Pacific",
		code: "VU",
	},
	{
		name: "Wallis and Futuna",
		flag: "🇼🇫",
		region: "Asia & Pacific",
		code: "WF",
	},
	{
		name: "Samoa",
		flag: "🇼🇸",
		region: "Asia & Pacific",
		code: "WS",
	},
	{
		name: "Yemen",
		flag: "🇾🇪",
		region: "Arab States",
		code: "YE",
	},
	{
		name: "Mayotte",
		flag: "🇾🇹",
		region: "Africa",
		code: "YT",
	},
	{
		name: "South Africa",
		flag: "🇿🇦",
		region: "Africa",
		code: "ZA",
	},
	{
		name: "Zambia",
		flag: "🇿🇲",
		region: "Africa",
		code: "ZM",
	},
	{
		name: "Zimbabwe",
		flag: "🇿🇼",
		region: "Africa",
		code: "ZW",
	},
	{
		name: "Eswatini",
		flag: "🇸🇿",
		region: "Africa",
		code: "SZ",
	},
	{
		name: "North Macedonia",
		flag: "🇲🇰",
		region: "Europe",
		code: "MK",
	},
	{
		name: "Philippines",
		flag: "🇵🇭",
		region: "Asia & Pacific",
		code: "PH",
	},
	{
		name: "Netherlands",
		flag: "🇳🇱",
		region: "Europe",
		code: "NL",
	},
	{
		name: "United Arab Emirates",
		flag: "🇦🇪",
		region: "Arab States",
		code: "AE",
	},
	{
		name: "Republic of Moldova",
		flag: "🇲🇩",
		region: "Europe",
		code: "MD",
	},
	{
		name: "Gambia",
		flag: "🇬🇲",
		region: "Africa",
		code: "GM",
	},
	{
		name: "Dominican Republic",
		flag: "🇩🇴",
		region: "South/Latin America",
		code: "DO",
	},
	{
		name: "Sudan",
		flag: "🇸🇩",
		region: "Arab States",
		code: "SD",
	},
	{
		name: "Lao People's Democratic Republic",
		flag: "🇱🇦",
		region: "Asia & Pacific",
		code: "LA",
	},
	{
		name: "Taiwan, Province of China",
		flag: "🇹🇼",
		region: "Asia & Pacific",
		code: "TW",
	},
	{
		name: "Republic of the Congo",
		flag: "🇨🇬",
		region: "Africa",
		code: "CG",
	},
	{
		name: "Czechia",
		flag: "🇨🇿",
		region: "Europe",
		code: "CZ",
	},
	{
		name: "United Kingdom",
		flag: "🇬🇧",
		region: "Europe",
		code: "GB",
	},
	{
		name: "Niger",
		flag: "🇳🇪",
		region: "Africa",
		code: "NE",
	},
	{
		name: "Democratic Republic of the Congo",
		flag: "🇨🇩",
		region: "Africa",
		code: "CD",
	},
	{
		name: "Commonwealth of The Bahamas",
		flag: "🇧🇸",
		region: "Caribbean",
		code: "BS",
	},
	{
		name: "Cocos (Keeling) Islands",
		flag: "🇨🇨",
		region: "Australia",
		code: "CC",
	},
	{
		name: "Central African Republic",
		flag: "🇨🇫",
		region: "Africa",
		code: "CF",
	},
	{
		name: "Cook Islands",
		flag: "🇨🇰",
		region: "South Pacific Ocean",
		code: "CK",
	},
	{
		name: "Falkland Islands",
		flag: "🇫🇰",
		region: "South Atlantic Ocean",
		code: "FK",
	},
	{
		name: "Faroe Islands",
		flag: "🇫🇴",
		region: "Europe",
		code: "FO",
	},
	{
		name: "Territory of Heard Island and McDonald Islands",
		flag: "🇭🇲",
		region: "Indian Ocean",
		code: "HM",
	},
	{
		name: "British Indian Ocean Territory",
		flag: "🇮🇴",
		region: "Indian Ocean",
		code: "IO",
	},
	{
		name: "Comoros",
		flag: "🇰🇲",
		region: "Indian Ocean",
		code: "KM",
	},
	{
		name: "Cayman Islands",
		flag: "🇰🇾",
		region: "Caribbean Sea",
		code: "KY",
	},
	{
		name: "Republic of the Marshall Islands",
		flag: "🇲🇭",
		region: "Pacific Ocean",
		code: "MH",
	},
	{
		name: "Commonwealth of the Northern Mariana Islands",
		flag: "🇲🇵",
		region: "Pacific Ocean",
		code: "MP",
	},
	{
		name: "Turks and Caicos Islands",
		flag: "🇹🇨",
		region: "Atlantic Ocean",
		code: "TC",
	},
	{
		name: "French Southern and Antarctic Lands",
		flag: "🇹🇫",
		region: "Indian Ocean",
		code: "TF",
	},
	{
		name: "United States Minor Outlying Islands",
		flag: "🇺🇲",
		region: "Pacific Ocean",
		code: "UM",
	},
	{
		name: "Holy See",
		flag: "🇻🇦",
		region: "Europe",
		code: "VA",
	},
];

const codes = countries.map((country) => country.code);

const isCountryCode = (code) => codes.includes(code);

const getCountryByCode = (code) => {
	if (!isCountryCode(code)) return undefined;
	return countries.find((c) => c.code === code);
};

const EARTH = getCountryByCode("EARTH");

export default { countries, codes, isCountryCode, getCountryByCode, EARTH };