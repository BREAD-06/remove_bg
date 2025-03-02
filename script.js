document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("imageInput");
    const removeBgButton = document.getElementById("removeBgButton");
    const previewImage = document.getElementById("previewImage");
    const processedImage = document.getElementById("processedImage");
    const downloadButton = document.getElementById("downloadButton");

    const TARGET_WIDTH = 264;
    const TARGET_HEIGHT = 191;

    if (!imageInput || !removeBgButton || !previewImage || !processedImage || !downloadButton) {
        console.error("❌ Error: Required elements not found in HTML!");
        return;
    }

    imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) {
            alert("Please select an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                // Create a canvas for resizing
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = TARGET_WIDTH;
                canvas.height = TARGET_HEIGHT;

                // Draw image on the canvas with the new dimensions
                ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

                // Convert canvas to data URL
                previewImage.src = canvas.toDataURL("image/png");
                previewImage.style.display = "block";

                // Show remove background button
                removeBgButton.style.display = "block";

                // Hide processed image and download button (reset)
                processedImage.style.display = "none";
                downloadButton.style.display = "none";

                // Convert the resized image back to a Blob for API processing
                canvas.toBlob(function (blob) {
                    window.uploadedFile = new File([blob], "resized-image.png", { type: "image/png" });
                }, "image/png");
            };
        };

        reader.readAsDataURL(file);
    });

    removeBgButton.addEventListener("click", async function () {
        if (!window.uploadedFile) {
            alert("No image uploaded. Please upload an image first.");
            return;
        }

        const formData = new FormData();
        formData.append("image_file", window.uploadedFile);
        formData.append("size", "auto");

        try {
            console.log("📤 Sending image to API...");
            const response = await fetch("https://api.remove.bg/v1.0/removebg", {
                method: "POST",
                headers: {
                    "X-Api-Key": "m1FJ5oSuQTRhUTpEJKiU4Vrp"
                },
                body: formData
            });

            console.log("📥 Response received...");
            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error("Background removal failed: " + errorMsg);
            }

            console.log("✅ Converting response to image...");
            const blob = await response.blob();

            // Ensure the response is actually an image
            if (!blob.type.startsWith("image/")) {
                throw new Error("Invalid response format. Received non-image data.");
            }

            const imageUrl = URL.createObjectURL(blob);

            // Show processed image
            processedImage.src = imageUrl;
            processedImage.style.display = "block";

            // Show download button
            downloadButton.style.display = "block";
            downloadButton.onclick = function () {
                const link = document.createElement("a");
                link.href = imageUrl;
                link.download = "processed-image.png";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            processedImage.onload = function () {
                console.log("✔️ Processed image loaded successfully!");
            };
            processedImage.onerror = function () {
                console.error("❌ Failed to load processed image!");
            };

        } catch (error) {
            alert("❌ Error: " + error.message);
            console.error("Fetch Error:", error);
        }
    });
});
