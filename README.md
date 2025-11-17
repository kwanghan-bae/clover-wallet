# Clover Wallet Backend

This project is the backend API for the Clover Lotto integrated app, built with Kotlin and Spring Boot.

## Firebase Admin SDK Setup

To enable Firebase Cloud Messaging (FCM) functionality, you need to set up the Firebase Admin SDK.

1.  **Create a Firebase Project:** If you haven't already, create a project in the [Firebase Console](https://console.firebase.google.com/).
2.  **Generate a Service Account Key:**
    *   In your Firebase project, go to **Project settings** (gear icon) > **Service accounts**.
    *   Click on **Generate new private key** and then **Generate key**.
    *   A JSON file containing your service account key will be downloaded. **Keep this file secure and do not commit it to version control.**
3.  **Configure the Backend:**
    *   Place the downloaded JSON service account key file in a secure location on your server or local machine (e.g., outside the project directory).
    *   Set the path to this JSON file using the `firebase.service-account-key-path` Spring Boot application property. You can do this in `application.properties`, `application.yml`, or via an environment variable.

    **Example (application.properties):**
    ```properties
    firebase.service-account-key-path=/path/to/your/serviceAccountKey.json
    ```

    **Example (Environment Variable):**
    ```bash
    export FIREBASE_SERVICE_ACCOUNT_KEY_PATH=/path/to/your/serviceAccountKey.json
    ./gradlew bootRun
    ```

    Without this configuration, the Firebase Admin SDK will not initialize, and FCM features will not work.
