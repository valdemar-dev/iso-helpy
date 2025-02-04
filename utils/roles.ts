
import config from "dotenv";
config.config();

const roles  = process.env.ENVIRONMENT === "development" 
? {
    staff: "1260922534778507274",
    verified: "1260922555708215338",
    common: "1154843646873567283",
    voicePing: "1260922534778507274",
    shadowBan: "1260922555708215338",
} : {
    staff: "1154843607505838121",
    verified: "1158038148748673024",
    common: "1154843646873567283",
    voicePing: "1154843855951233166",
    shadowBan: "1336300719900459038",
} 

export default roles;
