"use client";

import { saveAs } from "file-saver";
import Image from "next/image";
import React from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { FaDownload, FaTrashAlt } from "react-icons/fa";
import { ThreeDots } from "react-loader-spinner";

export default function Home() {
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState("");
  const [outputImage, setOutputImage] = React.useState<string | null>(null);
  const [base64Image, setBase64Image] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);

  const acceptedFileTypes = {
    "image/jpeg": [".jpeg", ".png"],
  };

  const maxFileSize = 4 * 1024 * 1024;

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (rejectedFiles.length > 0) {
      console.log(rejectedFiles);
      setError("Please upload a PNG or JPG image less than 4MB");
      return;
    }

    handleDelete();

    console.log(acceptedFiles);
    setFile(acceptedFiles[0]);

    const reader = new FileReader();
    reader.readAsDataURL(acceptedFiles[0]);
    reader.onload = () => {
      const binaryStr = reader.result as string;
      setBase64Image(binaryStr);
    };
  };

  const fileSize = (size: number): string => {
    if (size === 0) {
      return "0 Bytes";
    }

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + "" + sizes[i];
  };

  const handleDelete = (): void => {
    setFile(null);
    setOutputImage(null);
    setBase64Image(null);
    setError("");
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const response = await fetch("/api/replicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image }),
    });

    const result = await response.json();
    console.log(result);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setOutputImage(result.output);
    setLoading(false);
  };

  const handleDownload = () => {
    saveAs(outputImage as string, "output.png");
  };

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      {/* Header Section */}
      <section className="text-center mb-10">
        <h1 className="font-semibold text-transparent text-5xl bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block bg-clip-text leading-normal">
          Remove background
        </h1>
      </section>

      {/* Dropzone Section */}
      <section className="w-full max-w-lg mx-auto mb-12">
        <div className="w-full text-center border-4 border-gray-500 border-dashed rounded-md cursor-pointer mb-2 text-gray-500">
          <Dropzone
            onDrop={onDrop}
            multiple={false}
            maxSize={maxFileSize}
            accept={acceptedFileTypes}
          >
            {({ getRootProps, getInputProps }) => (
              <section>
                <div className="p-10" {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag and drop some files here, or click to select file</p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>

        {error && (
          <div className="flex justify-center">
            <p className="text-md text-yellow-500">{error}</p>
          </div>
        )}

        {file && (
          <div className="flex items-center justify-center mt-2">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className={`text-white text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l rounded-lg px-4 py-2 mt-3 text-center mb-2 ${
                loading && "cursor-progress"
              }`}
            >
              Remove background
            </button>
          </div>
        )}
      </section>

      {/* Images Section */}
      <section className="grid grid-cols-2 gap-4 mt-3">
        {file && (
          <>
            <div className="relative">
              <Image
                width={500}
                height={400}
                alt={file.name}
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover"
              />

              <button
                className="absolute top-0 right-0 p-3 text-black bg-yellow-500 hover:bg-yellow-400"
                onClick={() => handleDelete()}
              >
                <FaTrashAlt className="w-6 h-6 duration-300" />
              </button>

              <div className="absolute left-0 right-0 bottom-0 bg-gray-900 bg-opacity-50 text-white text-md p-2">
                {file.name} ({fileSize(file.size)})
              </div>
            </div>

            <div className="flex items-center justify-center relative">
              {loading && (
                <ThreeDots
                  width="60"
                  height="60"
                  color="#eeeeee"
                  visible={true}
                  ariaLabel="three-dots-loading"
                />
              )}

              {outputImage && (
                <>
                  <Image
                    width={500}
                    height={400}
                    alt="output"
                    src={outputImage}
                    className="object-cover w-full h-full"
                  />

                  <button
                    className="absolute top-0 right-0 p-3 text-black bg-yellow-500 hover:bg-yellow-400"
                    onClick={() => handleDownload()}
                  >
                    <FaDownload className="w-6 h-6 duration-300" />
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
