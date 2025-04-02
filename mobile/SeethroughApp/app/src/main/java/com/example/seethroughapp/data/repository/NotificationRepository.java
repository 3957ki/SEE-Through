package com.example.seethroughapp.data.repository;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

public class NotificationRepository {
    private final MutableLiveData<String> notificationLiveData = new MutableLiveData<>();

    public void updateNotification(String message) {
        notificationLiveData.postValue(message);
    }

    public LiveData<String> getNotificationLiveData() {
        return notificationLiveData;
    }
}