// import express, { Request, Response, Router } from "express";
// class UploadRouter {
//   public router: Router;
//   private uploadthing: Uploadthing;

//   constructor() {
//     this.router = Router();
//     this.uploadthing = new Uploadthing();

//     // Initialize routes
//     this.initRoutes();
//   }

//   private initRoutes() {
//     const uploadMiddleware = multer().single("file");

//     this.router.post("/upload", uploadMiddleware, this.handleFileUpload.bind(this));
//   }

//   private async handleFileUpload(req: Request, res: Response): Promise<void> {
//     try {
//       if (!req.file) {
//         res.status(400).json({ message: "No file uploaded" });
//         return;
//       }

//       const uploadResult = await this.uploadthing.upload({
//         file: req.file.buffer,
//         filename: req.file.originalname,
//       });

//       res.status(200).json({
//         message: "File uploaded successfully",
//         data: uploadResult,
//       });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Error uploading file" });
//     }
//   }
// }

// export default new UploadRouter().router;
