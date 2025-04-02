package com.example.seethroughapp.ui;

import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.seethroughapp.R;
import com.example.seethroughapp.adapter.InOutLogAdapter;
import com.example.seethroughapp.data.model.inoutlog.InOutLog;
import com.example.seethroughapp.viewmodel.SeeThroughViewModel;

import java.util.List;

public class InOutLogActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private InOutLogAdapter inOutLogAdapter;
    private SeeThroughViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_inoutlogs);

        recyclerView = findViewById(R.id.recyclerViewIngredients);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        viewModel = new ViewModelProvider(this).get(SeeThroughViewModel.class);
        viewModel.getInOutLogs().observe(this, this::updateInOutLogs);

        viewModel.fetchInOutLogs();
    }

    private void updateInOutLogs(List<InOutLog> inOutLogs) {
        inOutLogAdapter = new InOutLogAdapter(inOutLogs);
        recyclerView.setAdapter(inOutLogAdapter);
    }
}
