plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "com.example.seethroughapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.seethroughapp"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {

    // 기존 의존성
    implementation(libs.appcompat)
    implementation(libs.material)
    implementation(libs.activity)
    implementation(libs.constraintlayout)
    testImplementation(libs.junit)
    androidTestImplementation(libs.ext.junit)
    androidTestImplementation(libs.espresso.core)

    // Retrofit
    implementation(libs.retrofit)
    implementation(libs.converter.gson)

    // OkHttp (Retrofit과 함께 사용)
    implementation(libs.okhttp)
    implementation(libs.logging.interceptor)

    // Gson (Retrofit의 JSON 변환을 위한 라이브러리)
    implementation(libs.gson)

    // Lombok 추가
    implementation(libs.lombok)
    annotationProcessor(libs.lombok)
}
