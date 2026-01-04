const countryCodes = [
  "br", "us", "de", "jp", "fr", "ca", "in", "tr", "gb", "cn",
  "it", "ar", "au", "za", "es", "mx", "kr", "ru", "se", "no",
  "fi", "dk", "nl", "be", "ch", "pl", "gr", "pt", "ie", "sg",
  "nz", "hk", "pk", "eg", "my", "id", "th", "ph", "vn", "sa",
  "ae", "cl", "co", "pe", "cz", "hu", "ro", "bg", "sk", "rs",
  "tr", "by", "ua", "kz", "az", "ge", "am", "uz", "kg", "tj",
  "lk", "bn", "mm", "kh", "la", "mn", "af", "np", "bd", "bh",
  "om", "qa", "kw", "ye", "dz", "ma", "tn", "ly", "sd", "ng",
  "gh", "ci", "sn", "ke", "tz", "ug", "rw", "zm", "mz", "zw",
  "na", "bw", "ls", "sz", "eh", "so", "td", "ml", "mr", "bi",
];

const flagUrls = countryCodes.map(
  (code) => `https://flagcdn.com/w320/${code}.png`
);

export default flagUrls;