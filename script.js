document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("imageInput");
    const removeBgButton = document.getElementById("removeBgButton");
    const previewImage = document.getElementById("previewImage");
    const processedImage = document.getElementById("processedImage");

    if (!imageInput || !removeBgButton || !previewImage) {
        console.error("❌ Error: Required elements not found in HTML!");
        return;
    }

    imageInput.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (!file) {
            alert("Please select an image file.");
            return;
        }

        // Show preview
        previewImage.src = URL.createObjectURL(file);
        previewImage.style.display = "block";

        // Show remove background button
        removeBgButton.style.display = "block";

        // Store file for processing
        window.uploadedFile = file;
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
                    "X-Api-Key": "JwPvQ4eLU3Dn4XrFX481PJ6u" 
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

            // Force reload to ensure image updates
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
