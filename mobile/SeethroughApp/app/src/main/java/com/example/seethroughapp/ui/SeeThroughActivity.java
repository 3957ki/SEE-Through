package com.example.seethroughapp.ui;

import android.os.Bundle;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.example.seethroughapp.R;
import com.example.seethroughapp.model.ingredient.Ingredient;
import com.example.seethroughapp.viewmodel.SeeThroughViewModel;

import java.util.List;

public class SeeThroughActivity extends AppCompatActivity {

    private TextView ingredientText;
    private SeeThroughViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_seethrough);

        ingredientText = findViewById(R.id.tv_ingredients);

        viewModel = new ViewModelProvider(this).get(SeeThroughViewModel.class);
        viewModel.getData().observe(this, this::displayData);
        viewModel.fetchData();
    }

    private void displayData(List<Ingredient> data) {
        if (data != null && !data.isEmpty()){
            StringBuilder ingredientString = new StringBuilder();
            for (Ingredient item : data)
                ingredientString.append(item.getName()).append(" ");
            ingredientText.setText(ingredientString.toString());
        }else{
            Toast.makeText(this, "데이터 없음", Toast.LENGTH_SHORT).show();
        }
    }
}
