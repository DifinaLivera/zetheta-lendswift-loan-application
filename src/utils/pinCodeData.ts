export interface PinCodeInfo {
  pin: string;
  city: string;
  state: string;
  postOffice: string;
}

export const PIN_CODE_DATA: Record<string, PinCodeInfo> = {
  // Andhra Pradesh (AP)
  "500001": { pin: "500001", city: "Hyderabad", state: "Andhra Pradesh", postOffice: "Hyderabad G.P.O." },
  "530001": { pin: "530001", city: "Visakhapatnam", state: "Andhra Pradesh", postOffice: "Visakhapatnam Port" },
  "520001": { pin: "520001", city: "Vijayawada", state: "Andhra Pradesh", postOffice: "Vijayawada C.P.O." },
  
  // Arunachal Pradesh (AR)
  "791111": { pin: "791111", city: "Itanagar", state: "Arunachal Pradesh", postOffice: "Itanagar S.O" },
  
  // Assam (AS)
  "781001": { pin: "781001", city: "Guwahati", state: "Assam", postOffice: "Guwahati G.P.O." },
  "784001": { pin: "784001", city: "Tezpur", state: "Assam", postOffice: "Tezpur Court" },

  // Bihar (BR)
  "800001": { pin: "800001", city: "Patna", state: "Bihar", postOffice: "Patna G.P.O." },
  "842001": { pin: "842001", city: "Muzaffarpur", state: "Bihar", postOffice: "Muzaffarpur HeadPO" },

  // Chhattisgarh (CG)
  "492001": { pin: "492001", city: "Raipur", state: "Chhattisgarh", postOffice: "Raipur G.P.O." },

  // Goa (GA)
  "403001": { pin: "403001", city: "Panaji", state: "Goa", postOffice: "Panaji Head Post Office" },

  // Gujarat (GJ)
  "380001": { pin: "380001", city: "Ahmedabad", state: "Gujarat", postOffice: "Ahmedabad G.P.O." },
  "395001": { pin: "395001", city: "Surat", state: "Gujarat", postOffice: "Surat Head Post Office" },
  "390001": { pin: "390001", city: "Vadodara", state: "Gujarat", postOffice: "Vadodara G.P.O." },

  // Haryana (HR)
  "122001": { pin: "122001", city: "Gurugram", state: "Haryana", postOffice: "Gurgaon Sector 12" },
  "121001": { pin: "121001", city: "Faridabad", state: "Haryana", postOffice: "Faridabad Sector 16" },

  // Himachal Pradesh (HP)
  "171001": { pin: "171001", city: "Shimla", state: "Himachal Pradesh", postOffice: "Shimla G.P.O." },

  // Jharkhand (JH)
  "834001": { pin: "834001", city: "Ranchi", state: "Jharkhand", postOffice: "Ranchi G.P.O." },
  
  // Karnataka (KA)
  "560001": { pin: "560001", city: "Bengaluru", state: "Karnataka", postOffice: "Raj Bhavan Post" },
  "560038": { pin: "560038", city: "Bengaluru", state: "Karnataka", postOffice: "Indiranagar" },
  "575001": { pin: "575001", city: "Mangaluru", state: "Karnataka", postOffice: "Mangalorean Head Off" },

  // Kerala (KL)
  "695001": { pin: "695001", city: "Thiruvananthapuram", state: "Kerala", postOffice: "Trivandrum G.P.O." },
  "682001": { pin: "682001", city: "Kochi", state: "Kerala", postOffice: "Ernakulam" },

  // Madhya Pradesh (MP)
  "462001": { pin: "462001", city: "Bhopal", state: "Madhya Pradesh", postOffice: "Bhopal G.P.O." },
  "452001": { pin: "452001", city: "Indore", state: "Madhya Pradesh", postOffice: "Indore G.P.O." },

  // Maharashtra (MH)
  "400001": { pin: "400001", city: "Mumbai", state: "Maharashtra", postOffice: "Mumbai G.P.O." },
  "400050": { pin: "400050", city: "Mumbai", state: "Maharashtra", postOffice: "Bandra West" },
  "411001": { pin: "411001", city: "Pune", state: "Maharashtra", postOffice: "Pune G.P.O." },
  "440001": { pin: "440001", city: "Nagpur", state: "Maharashtra", postOffice: "Nagpur G.P.O." },

  // Manipur (MN)
  "795001": { pin: "795001", city: "Imphal", state: "Manipur", postOffice: "Imphal S.O" },

  // Meghalaya (ML)
  "793001": { pin: "793001", city: "Shillong", state: "Meghalaya", postOffice: "Shillong S.O" },

  // Mizoram (MZ)
  "796001": { pin: "796001", city: "Aizawl", state: "Mizoram", postOffice: "Aizawl S.O" },

  // Nagaland (NL)
  "797001": { pin: "797001", city: "Kohima", state: "Nagaland", postOffice: "Kohima HeadSO" },

  // Odisha (OR)
  "751001": { pin: "751001", city: "Bhubaneswar", state: "Odisha", postOffice: "Bhubaneswar G.P.O." },

  // Punjab (PB)
  "143001": { pin: "143001", city: "Amritsar", state: "Punjab", postOffice: "Amritsar G.P.O." },
  "141001": { pin: "141001", city: "Ludhiana", state: "Punjab", postOffice: "Ludhiana HeadPO" },

  // Rajasthan (RJ)
  "302001": { pin: "302001", city: "Jaipur", state: "Rajasthan", postOffice: "Jaipur G.P.O." },
  "342001": { pin: "342001", city: "Jodhpur", state: "Rajasthan", postOffice: "Jodhpur HeadPO" },

  // Sikkim (SK)
  "737101": { pin: "737101", city: "Gangtok", state: "Sikkim", postOffice: "Gangtok G.P.O." },

  // Tamil Nadu (TN)
  "600001": { pin: "600001", city: "Chennai", state: "Tamil Nadu", postOffice: "Chennai G.P.O." },
  "600018": { pin: "600018", city: "Chennai", state: "Tamil Nadu", postOffice: "Teynampet" },
  "641001": { pin: "641001", city: "Coimbatore", state: "Tamil Nadu", postOffice: "Coimbatore Head Off" },

  // Telangana (TG)
  "500032": { pin: "500032", city: "Hyderabad", state: "Telangana", postOffice: "Gachibowli" },
  "500081": { pin: "500081", city: "Hyderabad", state: "Telangana", postOffice: "Madhapur" },

  // Tripura (TR)
  "799001": { pin: "799001", city: "Agartala", state: "Tripura", postOffice: "Agartala HeadSO" },

  // Uttarakhand (UT)
  "248001": { pin: "248001", city: "Dehradun", state: "Uttarakhand", postOffice: "Dehradun Main" },

  // Uttar Pradesh (UP)
  "226001": { pin: "226001", city: "Lucknow", state: "Uttar Pradesh", postOffice: "Lucknow G.P.O." },
  "201301": { pin: "201301", city: "Noida", state: "Uttar Pradesh", postOffice: "Noida Sector 30" },
  "208001": { pin: "208001", city: "Kanpur", state: "Uttar Pradesh", postOffice: "Kanpur G.P.O." },

  // West Bengal (WB)
  "700001": { pin: "700001", city: "Kolkata", state: "West Bengal", postOffice: "Kolkata G.P.O." },
  "711101": { pin: "711101", city: "Howrah", state: "West Bengal", postOffice: "Howrah HeadPO" },

  // Delhi (DL - UT)
  "110001": { pin: "110001", city: "New Delhi", state: "Delhi", postOffice: "Connaught Place HeadPO" },
  "110011": { pin: "110011", city: "New Delhi", state: "Delhi", postOffice: "Nirman Bhawan Office" },

  // Jammu & Kashmir (JK - UT)
  "190001": { pin: "190001", city: "Srinagar", state: "Jammu & Kashmir", postOffice: "Srinagar G.P.O." },
  "180001": { pin: "180001", city: "Jammu", state: "Jammu & Kashmir", postOffice: "Jammu Tawi S.O" },

  // Ladakh (LA - UT)
  "194101": { pin: "194101", city: "Leh", state: "Ladakh", postOffice: "Leh S.O" },

  // Andaman & Nicobar (AN - UT)
  "744101": { pin: "744101", city: "Port Blair", state: "Andaman & Nicobar", postOffice: "Port Blair Head Off" },

  // Chandigarh (CH - UT)
  "160017": { pin: "160017", city: "Chandigarh", state: "Chandigarh", postOffice: "Chandigarh Sector 17" },

  // Dadra & Nagar Haveli and Daman & Diu (DN - UT)
  "396230": { pin: "396230", city: "Silvassa", state: "Dadra & Nagar Haveli", postOffice: "Silvassa S.O" },
  "396210": { pin: "396210", city: "Daman", state: "Daman & Diu", postOffice: "Daman S.O" },

  // Lakshadweep (LD - UT)
  "682555": { pin: "682555", city: "Kavaratti", state: "Lakshadweep", postOffice: "Kavaratti S.O" },

  // Puducherry (PY - UT)
  "605001": { pin: "605001", city: "Puducherry", state: "Puducherry", postOffice: "Puducherry Head Off" }
};

// Generate some additional mock records to reach 100+ required by instructions
const additionalPins = [
  { pin: "400002", city: "Mumbai", state: "Maharashtra", postOffice: "Kalbadevi" },
  { pin: "560002", city: "Bengaluru", state: "Karnataka", postOffice: "Kempegowda Road" },
  { pin: "600002", city: "Chennai", state: "Tamil Nadu", postOffice: "Mount Road" },
  { pin: "700002", city: "Kolkata", state: "West Bengal", postOffice: "Cossipore" },
  { pin: "110002", city: "New Delhi", state: "Delhi", postOffice: "Indraprastha Head Office" },
  { pin: "500002", city: "Hyderabad", state: "Telangana", postOffice: "Charminar" },
  { pin: "380002", city: "Ahmedabad", state: "Gujarat", postOffice: "Kalupur" },
  { pin: "411002", city: "Pune", state: "Maharashtra", postOffice: "Bajirao Road" },
  { pin: "452002", city: "Indore", state: "Madhya Pradesh", postOffice: "Nandanagar" },
  { pin: "226002", city: "Lucknow", state: "Uttar Pradesh", postOffice: "Lucknow Chowk" },
  { pin: "302002", city: "Jaipur", state: "Rajasthan", postOffice: "Sanganer" },
  { pin: "695002", city: "Thiruvananthapuram", state: "Kerala", postOffice: "Karamana" },
  { pin: "530002", city: "Visakhapatnam", state: "Andhra Pradesh", postOffice: "Suryabagh" },
  { pin: "800002", city: "Patna", state: "Bihar", postOffice: "Patna City S.O." },
  { pin: "492002", city: "Raipur", state: "Chhattisgarh", postOffice: "Raipur City" },
  { pin: "403002", city: "Margao", state: "Goa", postOffice: "Margao PO" },
  { pin: "122002", city: "Gurugram", state: "Haryana", postOffice: "DLF Phase I" },
  { pin: "171002", city: "Shimla", state: "Himachal Pradesh", postOffice: "Shimla West" },
  { pin: "834002", city: "Ranchi", state: "Jharkhand", postOffice: "Doranda S.O." },
  { pin: "751002", city: "Bhubaneswar", state: "Odisha", postOffice: "Ashok Nagar S.O." },
  { pin: "143002", city: "Amritsar", state: "Punjab", postOffice: "Khalsa College S.O." },
  { pin: "737102", city: "Gangtok", state: "Sikkim", postOffice: "Ranipool S.O." },
  { pin: "248002", city: "Dehradun", state: "Uttarakhand", postOffice: "Rajpur Road S.O." },
  { pin: "201302", city: "Noida", state: "Uttar Pradesh", postOffice: "Noida Sector 62" },
  { pin: "700091", city: "Kolkata", state: "West Bengal", postOffice: "Salt Lake Sector V" },
  { pin: "560103", city: "Bengaluru", state: "Karnataka", postOffice: "Bellandur" },
  { pin: "560066", city: "Bengaluru", state: "Karnataka", postOffice: "Whitefield" },
  { pin: "560076", city: "Bengaluru", state: "Karnataka", postOffice: "Bannerghatta Road" },
  { pin: "400051", city: "Mumbai", state: "Maharashtra", postOffice: "Bandra Kurla Complex" },
  { pin: "400013", city: "Mumbai", state: "Maharashtra", postOffice: "Lower Parel" },
  { pin: "600096", city: "Chennai", state: "Tamil Nadu", postOffice: "Perungudi" },
  { pin: "600119", city: "Chennai", state: "Tamil Nadu", postOffice: "Sholinganallur" },
  { pin: "500019", city: "Hyderabad", state: "Telangana", postOffice: "Kukatpally" },
  { pin: "500049", city: "Hyderabad", state: "Telangana", postOffice: "Miyapur" },
  { pin: "110016", city: "New Delhi", state: "Delhi", postOffice: "IIT Delhi" },
  { pin: "110021", city: "New Delhi", state: "Delhi", postOffice: "Chanakyapuri S.O." },
  { pin: "380009", city: "Ahmedabad", state: "Gujarat", postOffice: "Navrangpura" },
  { pin: "380015", city: "Ahmedabad", state: "Gujarat", postOffice: "Sathal" },
  { pin: "411007", city: "Pune", state: "Maharashtra", postOffice: "Aundh S.O." },
  { pin: "411038", city: "Pune", state: "Maharashtra", postOffice: "Kothrud S.O." },
  { pin: "452003", city: "Indore", state: "Madhya Pradesh", postOffice: "Vijay Nagar" },
  { pin: "452010", city: "Indore", state: "Madhya Pradesh", postOffice: "Sukhliya S.O." },
  { pin: "226010", city: "Lucknow", state: "Uttar Pradesh", postOffice: "Gomti Nagar HeadPO" },
  { pin: "226021", city: "Lucknow", state: "Uttar Pradesh", postOffice: "Aliganj S.O." },
  { pin: "302015", city: "Jaipur", state: "Rajasthan", postOffice: "Jaipur Malviya Nagar" },
  { pin: "302020", city: "Jaipur", state: "Rajasthan", postOffice: "Mansarovar S.O." },
  { pin: "682020", city: "Kochi", state: "Kerala", postOffice: "Kadavanthra" },
  { pin: "682030", city: "Kochi", state: "Kerala", postOffice: "Thrikkakara" },
  { pin: "122018", city: "Gurugram", state: "Haryana", postOffice: "Gurugram Sector 45" },
  { pin: "122011", city: "Gurugram", state: "Haryana", postOffice: "DLF Phase III" },
  { pin: "201305", city: "Noida", state: "Uttar Pradesh", postOffice: "Noida Phase II" },
  { pin: "201310", city: "Noida", state: "Uttar Pradesh", postOffice: "Greater Noida" }
];

additionalPins.forEach(item => {
  if (!PIN_CODE_DATA[item.pin]) {
    PIN_CODE_DATA[item.pin] = item;
  }
});

// A state mapping for verification of states
export const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman & Nicobar", "Chandigarh", "Dadra & Nagar Haveli", "Daman & Diu", "Delhi", "Jammu & Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry"
];

export function lookupPinCode(pin: string): Promise<PinCodeInfo | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const match = PIN_CODE_DATA[pin.trim()];
      resolve(match || null);
    }, 800); // Simulated delay
  });
}
