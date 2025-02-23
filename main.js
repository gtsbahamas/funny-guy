import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";

export default function FaceSwapApp() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedClip, setSelectedClip] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleClipSelection = (clip) => {
    setSelectedClip(clip);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedClip) {
      alert("Please upload a face and select a clip.");
      return;
    }
    
    const formData = new FormData();
    formData.append("face", selectedFile);
    formData.append("clip", selectedClip);

    try {
      const response = await fetch("/api/process-face-swap", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      setPreviewUrl(data.videoUrl);
    } catch (error) {
      console.error("Error processing video:", error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Funny Golf Face Swap</h1>
      
      <Card className="p-4 w-full max-w-md">
        <CardContent>
          <label className="flex items-center gap-2 cursor-pointer">
            <Upload size={20} />
            <span>Upload Your Face</span>
            <Input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Select a Clip:</h2>
        <div className="flex gap-2 mt-2">
          <Button onClick={() => handleClipSelection("clip1.mp4")}>Clip 1</Button>
          <Button onClick={() => handleClipSelection("clip2.mp4")}>Clip 2</Button>
          <Button onClick={() => handleClipSelection("clip3.mp4")}>Clip 3</Button>
        </div>
      </div>
      
      <Button className="mt-6" onClick={handleUpload}>
        Generate Video
      </Button>
      
      {previewUrl && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Preview:</h2>
          <video src={previewUrl} controls className="mt-2 w-full max-w-md" />
        </div>
      )}
    </div>
  );
}

// Backend API (Node.js + Express)
const express = require("express");
const multer = require("multer");
const path = require("path");
const { processFaceSwap } = require("./facefusion-service");
const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/api/process-face-swap", upload.fields([{ name: "face" }, { name: "clip" }]), async (req, res) => {
  try {
    const facePath = req.files["face"][0].path;
    const clipPath = req.files["clip"][0].path;
    const processedVideoUrl = await processFaceSwap(facePath, clipPath);
    res.json({ videoUrl: processedVideoUrl });
  } catch (error) {
    console.error("Error processing face swap:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

// FaceFusion Integration (facefusion-service.js)
const { FaceFusion } = require("facefusion");
const fs = require("fs");
const path = require("path");

async function processFaceSwap(facePath, clipPath) {
  const outputPath = path.join("processed_videos", `output_${Date.now()}.mp4`);
  
  await FaceFusion.swap({
    face: facePath,
    video: clipPath,
    output: outputPath,
  });
  
  return outputPath;
}

module.exports = { processFaceSwap };
