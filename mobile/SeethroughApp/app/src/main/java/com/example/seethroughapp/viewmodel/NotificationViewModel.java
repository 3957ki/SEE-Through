package com.example.seethroughapp.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.ViewModel;

import com.example.seethroughapp.data.repository.NotificationRepository;

public class NotificationViewModel extends ViewModel {
    private final NotificationRepository repository = new NotificationRepository();

    public LiveData<String> getNotification() {
        return repository.getNotificationLiveData();
    }
}