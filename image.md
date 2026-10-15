Step 1: Install Node.js
![alt text](image.png)

Step 2: Create your project
![alt text](image-1.png)
![alt text](image-2.png)
![alt text](image-3.png)

Step 3: Create the folders and files
![alt text](image-4.png)

Step 4 — Build the file upload feature BEFORE security

4.1 Create the frontend
![alt text](image-5.png)

4.2 Create the vulnerable backend
![alt text](image-6.png)

4.3 Run the vulnerable version
![alt text](image-7.png)

Open your browser and visit:
http://localhost:3000
![alt text](image-8.png)

Select a normal PDF or image, then click Upload File.
You should see the upload success message. Check your uploads folder to confirm that the file was saved.
![alt text](image-9.png)

4.4 Test the weakness
Upload photo.jpg	Accepted
![alt text](image-10.png)

Upload document.pdf	Accepted
![alt text](image-11.png)

Upload test.txt	Accepted
![alt text](image-12.png)

Upload test.exe containing plain text	Accepted
![alt text](image-13.png)

the upload form, a successful upload, and the uploaded test.exe appearing in the uploads folder. These will demonstrate the weakness before security is added.

Step 5 — Implement security AFTER the baseline test

The security measures will be:
Security measure	What it prevents
Extension allowlist	Rejects file names with disallowed extensions
MIME-type validation	Rejects disallowed declared file types
File-signature checks	Detects files whose contents do not match the claimed type
2 MB size limit	Restricts oversized uploads
Random server-generated filenames	Avoids trusting user-supplied filenames
Private storage	Keeps uploads outside the public website directory
Error handling	Returns a controlled response when a file is rejected

We will allow only JPEG, PNG, and PDF files.

5.1 Replace secure_server.js with the secure version

![alt text](image-14.png)
This is a learning implementation of layered upload checks. Signature validation is not a complete malware scanner, and checking only the file header does not prove that an entire file is safe. Production systems may also need deeper parsing, malware scanning, authentication, rate limiting, and isolated storage.

5.2 Restart the application
![alt text](image-15.png)

Refresh the local upload page.
![alt text](image-16.png)
The HTML form can remain unchanged. The difference is now in the server-side validation.

5.3.Test the secure version
Valid JPEG/PNG image	Accepted
![alt text](image-17.png)

Valid PDF document	Accepted
![alt text](image-18.png)

test.txt	Rejected
![alt text](image-19.png)

test.exe containing plain text	Rejected
![alt text](image-20.png)

PNG renamed to .jpg	Rejected if its signature does not match JPEG
![alt text](image-21.png)
![alt text](image-22.png)

File larger than 2 MB	Rejected
![alt text](image-23.png)

	![alt text](evidence/image-1.png)