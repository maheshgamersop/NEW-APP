import multer from 'multer'
import {v2 as cloudinary} from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary";
import shortid from "shortid";

cloudinary.config({
  cloud_name: "dfmpb2aii",
  api_key: "637296684939831",
  api_secret: "FTvJen8maIqkhI9KeUEpNfDjzvE",
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
   //format: async (req, file) => 'auto',
      resource_type: 'auto',
    public_id: (req, file) => `${shortid.generate()}-${file.originalname}`,
  },
});

const upload = multer({ storage: storage });
  export default upload;
