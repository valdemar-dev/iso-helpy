
import config from "dotenv";
config.config();

const roles  = process.env.ENVIRONMENT === "development" 
? {
    staff: "1260922534778507274",
    verified: "1260922555708215338",
} : {
    staff: "1154843607505838121",
    verified: "1158038148748673024",
} 

export default roles;
