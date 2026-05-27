export interface Country {
  id: string;
  name: string;
  code: string;
  flag: string;
  popular: boolean;
}

const countries: Country[] = [
  {
    id: "us",
    name: "United States",
    code: "+1",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/us.svg",
    popular: true
  },
  {
    id: "uk",
    name: "United Kingdom",
    code: "+44",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gb.svg",
    popular: true
  },
  {
    id: "ca",
    name: "Canada",
    code: "+1",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ca.svg",
    popular: true
  },
  {
    id: "fr",
    name: "France",
    code: "+33",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/fr.svg",
    popular: true
  },
  {
    id: "de",
    name: "Germany",
    code: "+49",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/de.svg",
    popular: true
  },
  {
    id: "es",
    name: "Spain",
    code: "+34",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/es.svg",
    popular: true
  },
  {
    id: "it",
    name: "Italy",
    code: "+39",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/it.svg",
    popular: true
  },
  {
    id: "ru",
    name: "Russia",
    code: "+7",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ru.svg",
    popular: true
  },
  {
    id: "in",
    name: "India",
    code: "+91",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/in.svg",
    popular: false
  },
  {
    id: "cn",
    name: "China",
    code: "+86",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/cn.svg",
    popular: false
  },
  {
    id: "nl",
    name: "Netherlands",
    code: "+31",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/nl.svg",
    popular: false
  },
  {
    id: "ua",
    name: "Ukraine",
    code: "+380",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ua.svg",
    popular: false
  },
  {
    id: "tr",
    name: "Turkey",
    code: "+90",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/tr.svg",
    popular: false
  },
  {
    id: "id",
    name: "Indonesia",
    code: "+62",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/id.svg",
    popular: false
  },
  {
    id: "ph",
    name: "Philippines",
    code: "+63",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ph.svg",
    popular: false
  },
  {
    id: "vn",
    name: "Vietnam",
    code: "+84",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/vn.svg",
    popular: false
  },
  {
    id: "pk",
    name: "Pakistan",
    code: "+92",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/pk.svg",
    popular: false
  },
  {
    id: "bd",
    name: "Bangladesh",
    code: "+880",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bd.svg",
    popular: false
  },
  {
    id: "se",
    name: "Sweden",
    code: "+46",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/se.svg",
    popular: false
  },
  {
    id: "pl",
    name: "Poland",
    code: "+48",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/pl.svg",
    popular: false
  },
  {
    id: "il",
    name: "Israel",
    code: "+972",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/il.svg",
    popular: false
  },
  {
    id: "kz",
    name: "Kazakhstan",
    code: "+7",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/kz.svg",
    popular: false
  },
  {
    id: "kg",
    name: "Kyrgyzstan",
    code: "+996",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/kg.svg",
    popular: false
  },
  {
    id: "ro",
    name: "Romania",
    code: "+40",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ro.svg",
    popular: false
  },
  {
    id: "co",
    name: "Colombia",
    code: "+57",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/co.svg",
    popular: false
  },
  {
    id: "eg",
    name: "Egypt",
    code: "+20",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/eg.svg",
    popular: false
  },
  {
    id: "ng",
    name: "Nigeria",
    code: "+234",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ng.svg",
    popular: false
  },
  {
    id: "jp",
    name: "Japan",
    code: "+81",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/jp.svg",
    popular: false
  },
  {
    id: "au",
    name: "Australia",
    code: "+61",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/au.svg",
    popular: false
  },
  {
    id: "br",
    name: "Brazil",
    code: "+55",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/br.svg",
    popular: false
  },
  {
    id: "za",
    name: "South Africa",
    code: "+27",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/za.svg",
    popular: false
  },
  {
    id: "mx",
    name: "Mexico",
    code: "+52",
    flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mx.svg",
    popular: false
  },
  { id: "gp", name: "Guadeloupe", code: "+590", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gp.svg", popular: false },
  { id: "ai", name: "Anguilla", code: "+1", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ai.svg", popular: false },
  { id: "lv", name: "Latvia", code: "+371", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/lv.svg", popular: false },
  { id: "pt", name: "Portugal", code: "+351", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/pt.svg", popular: false },
  { id: "ee", name: "Estonia", code: "+372", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ee.svg", popular: false },
  { id: "dk", name: "Denmark", code: "+45", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/dk.svg", popular: false },
  { id: "ie", name: "Ireland", code: "+353", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ie.svg", popular: false },
  { id: "rs", name: "Serbia", code: "+381", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/rs.svg", popular: false },
  { id: "lt", name: "Lithuania", code: "+370", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/lt.svg", popular: false },
  { id: "hr", name: "Croatia", code: "+385", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/hr.svg", popular: false },
  { id: "at", name: "Austria", code: "+43", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/at.svg", popular: false },
  { id: "by", name: "Belarus", code: "+375", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/by.svg", popular: false },
  { id: "si", name: "Slovenia", code: "+386", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/si.svg", popular: false },
  { id: "be", name: "Belgium", code: "+32", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/be.svg", popular: false },
  { id: "bg", name: "Bulgaria", code: "+359", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bg.svg", popular: false },
  { id: "hu", name: "Hungary", code: "+36", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/hu.svg", popular: false },
  { id: "md", name: "Moldova", code: "+373", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/md.svg", popular: false },
  { id: "gr", name: "Greece", code: "+30", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gr.svg", popular: false },
  { id: "is", name: "Iceland", code: "+354", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/is.svg", popular: false },
  { id: "sk", name: "Slovakia", code: "+421", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/sk.svg", popular: false },
  { id: "mc", name: "Monaco", code: "+377", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mc.svg", popular: false },
  { id: "al", name: "Albania", code: "+355", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/al.svg", popular: false },
  { id: "fi", name: "Finland", code: "+358", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/fi.svg", popular: false },
  { id: "lu", name: "Luxembourg", code: "+352", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/lu.svg", popular: false },
  { id: "me", name: "Montenegro", code: "+382", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/me.svg", popular: false },
  { id: "ch", name: "Switzerland", code: "+41", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ch.svg", popular: false },
  { id: "no", name: "Norway", code: "+47", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/no.svg", popular: false },
  { id: "cz", name: "Czech Republic", code: "+420", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/cz.svg", popular: false },
  { id: "ax", name: "Aland Islands", code: "+358", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ax.svg", popular: false },
  { id: "gi", name: "Gibraltar", code: "+350", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gi.svg", popular: false },
  { id: "ba", name: "Bosnia", code: "+387", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ba.svg", popular: false },
  { id: "mt", name: "Malta", code: "+356", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mt.svg", popular: false },
  { id: "my", name: "Malaysia", code: "+60", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/my.svg", popular: false },
  { id: "kh", name: "Cambodia", code: "+855", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/kh.svg", popular: false },
  { id: "la", name: "Laos", code: "+856", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/la.svg", popular: false },
  { id: "ye", name: "Yemen", code: "+967", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ye.svg", popular: false },
  { id: "uz", name: "Uzbekistan", code: "+998", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/uz.svg", popular: false },
  { id: "iq", name: "Iraq", code: "+964", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/iq.svg", popular: false },
  { id: "th", name: "Thailand", code: "+66", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/th.svg", popular: false },
  { id: "tw", name: "Taiwan", code: "+886", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/tw.svg", popular: false },
  { id: "mn", name: "Mongolia", code: "+976", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mn.svg", popular: false },
  { id: "af", name: "Afghanistan", code: "+93", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/af.svg", popular: false },
  { id: "cy", name: "Cyprus", code: "+357", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/cy.svg", popular: false },
  { id: "np", name: "Nepal", code: "+977", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/np.svg", popular: false },
  { id: "kw", name: "Kuwait", code: "+965", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/kw.svg", popular: false },
  { id: "om", name: "Oman", code: "+968", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/om.svg", popular: false },
  { id: "qa", name: "Qatar", code: "+974", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/qa.svg", popular: false },
  { id: "jo", name: "Jordan", code: "+962", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/jo.svg", popular: false },
  { id: "bn", name: "Brunei", code: "+673", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bn.svg", popular: false },
  { id: "ge", name: "Georgia", code: "+995", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ge.svg", popular: false },
  { id: "tj", name: "Tajikistan", code: "+992", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/tj.svg", popular: false },
  { id: "am", name: "Armenia", code: "+374", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/am.svg", popular: false },
  { id: "lb", name: "Lebanon", code: "+961", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/lb.svg", popular: false },
  { id: "bt", name: "Bhutan", code: "+975", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bt.svg", popular: false },
  { id: "mv", name: "Maldives", code: "+960", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mv.svg", popular: false },
  { id: "tm", name: "Turkmenistan", code: "+993", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/tm.svg", popular: false },
  { id: "sg", name: "Singapore", code: "+65", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/sg.svg", popular: false },
  { id: "hk", name: "Hong Kong", code: "+852", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/hk.svg", popular: false },
  { id: "az", name: "Azerbaijan", code: "+994", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/az.svg", popular: false },
  { id: "mo", name: "Macao", code: "+853", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mo.svg", popular: false },
  { id: "ke", name: "Kenya", code: "+254", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ke.svg", popular: false },
  { id: "tz", name: "Tanzania", code: "+255", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/tz.svg", popular: false },
  { id: "mg", name: "Madagascar", code: "+261", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mg.svg", popular: false },
  { id: "gm", name: "Gambia", code: "+220", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gm.svg", popular: false },
  { id: "ma", name: "Morocco", code: "+212", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ma.svg", popular: false },
  { id: "gh", name: "Ghana", code: "+233", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gh.svg", popular: false },
  { id: "cm", name: "Cameroon", code: "+237", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/cm.svg", popular: false },
  { id: "td", name: "Chad", code: "+235", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/td.svg", popular: false },
  { id: "dz", name: "Algeria", code: "+213", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/dz.svg", popular: false },
  { id: "sn", name: "Senegal", code: "+221", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/sn.svg", popular: false },
  { id: "gn", name: "Guinea", code: "+224", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gn.svg", popular: false },
  { id: "ml", name: "Mali", code: "+223", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ml.svg", popular: false },
  { id: "et", name: "Ethiopia", code: "+251", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/et.svg", popular: false },
  { id: "ug", name: "Uganda", code: "+256", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ug.svg", popular: false },
  { id: "ao", name: "Angola", code: "+244", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ao.svg", popular: false },
  { id: "mz", name: "Mozambique", code: "+258", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mz.svg", popular: false },
  { id: "tn", name: "Tunisia", code: "+216", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/tn.svg", popular: false },
  { id: "zw", name: "Zimbabwe", code: "+263", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/zw.svg", popular: false },
  { id: "tg", name: "Togo", code: "+228", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/tg.svg", popular: false },
  { id: "sz", name: "Swaziland", code: "+268", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/sz.svg", popular: false },
  { id: "mr", name: "Mauritania", code: "+222", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mr.svg", popular: false },
  { id: "bi", name: "Burundi", code: "+257", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bi.svg", popular: false },
  { id: "bj", name: "Benin", code: "+229", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bj.svg", popular: false },
  { id: "bw", name: "Botswana", code: "+267", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bw.svg", popular: false },
  { id: "km", name: "Comoros", code: "+269", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/km.svg", popular: false },
  { id: "lr", name: "Liberia", code: "+231", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/lr.svg", popular: false },
  { id: "ls", name: "Lesotho", code: "+266", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ls.svg", popular: false },
  { id: "mw", name: "Malawi", code: "+265", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mw.svg", popular: false },
  { id: "na", name: "Namibia", code: "+264", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/na.svg", popular: false },
  { id: "ne", name: "Niger", code: "+227", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ne.svg", popular: false },
  { id: "rw", name: "Rwanda", code: "+250", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/rw.svg", popular: false },
  { id: "zm", name: "Zambia", code: "+260", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/zm.svg", popular: false },
  { id: "so", name: "Somalia", code: "+252", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/so.svg", popular: false },
  { id: "ga", name: "Gabon", code: "+241", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ga.svg", popular: false },
  { id: "mu", name: "Mauritius", code: "+230", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/mu.svg", popular: false },
  { id: "dj", name: "Djibouti", code: "+253", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/dj.svg", popular: false },
  { id: "er", name: "Eritrea", code: "+291", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/er.svg", popular: false },
  { id: "sc", name: "Seychelles", code: "+248", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/sc.svg", popular: false },
  { id: "us_v", name: "United States (Virtual)", code: "+1", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/us.svg", popular: false },
  { id: "ht", name: "Haiti", code: "+509", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ht.svg", popular: false },
  { id: "ar", name: "Argentina", code: "+54", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ar.svg", popular: false },
  { id: "pe", name: "Peru", code: "+51", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/pe.svg", popular: false },
  { id: "ve", name: "Venezuela", code: "+58", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ve.svg", popular: false },
  { id: "py", name: "Paraguay", code: "+595", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/py.svg", popular: false },
  { id: "bo", name: "Bolivia", code: "+591", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bo.svg", popular: false },
  { id: "ec", name: "Ecuador", code: "+593", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ec.svg", popular: false },
  { id: "gy", name: "Guyana", code: "+592", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gy.svg", popular: false },
  { id: "sr", name: "Suriname", code: "+597", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/sr.svg", popular: false },
  { id: "cl", name: "Chile", code: "+56", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/cl.svg", popular: false },
  { id: "uy", name: "Uruguay", code: "+598", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/uy.svg", popular: false },
  { id: "aw", name: "Aruba", code: "+297", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/aw.svg", popular: false },
  { id: "au_v", name: "Australia (Virtual)", code: "+61", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/au.svg", popular: false },
  { id: "fj", name: "Fiji", code: "+679", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/fj.svg", popular: false },
  { id: "hn", name: "Honduras", code: "+504", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/hn.svg", popular: false },
  { id: "ni", name: "Nicaragua", code: "+505", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ni.svg", popular: false },
  { id: "gt", name: "Guatemala", code: "+502", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gt.svg", popular: false },
  { id: "bz", name: "Belize", code: "+501", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bz.svg", popular: false },
  { id: "jm", name: "Jamaica", code: "+1", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/jm.svg", popular: false },
  { id: "bb", name: "Barbados", code: "+1", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bb.svg", popular: false },
  { id: "bs", name: "Bahamas", code: "+1", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/bs.svg", popular: false },
  { id: "dm", name: "Dominica", code: "+1", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/dm.svg", popular: false },
  { id: "gd", name: "Grenada", code: "+1", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gd.svg", popular: false },
  { id: "ms", name: "Montserrat", code: "+1", flag: "https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/ms.svg", popular: false }
];

export default countries;
