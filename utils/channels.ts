import config from "dotenv";
config.config();

const channels = process.env.ENVIRONMENT === "development" 
? {
    ticketCategory: "1260907216219799624",
    verifiedImages: "1260940665127309312",
    verifiedSelfies: "1260948894129459253",
    unverifiedSelfies: "1260948911175110666",
    verificationInstructions: "1260962482021994496",
    confessions: "1260980217300914286",
} : {
    ticketCategory: "1158488340505579641",
    verifiedImages: "1161743772619649024",
    verifiedSelfies: "1158065122053468250",
    unverifiedSelfies: "1154844082317824052",
    verificationInstructions: "1178243971319865354",
    confessions: "1185549230786486332",
} 

export default channels;
