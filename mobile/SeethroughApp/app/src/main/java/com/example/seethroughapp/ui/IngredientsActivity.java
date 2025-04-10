package com.example.seethroughapp.ui;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.seethroughapp.R;
import com.example.seethroughapp.adapter.IngredientAdapter;
import com.example.seethroughapp.data.model.ingredient.Ingredient;
import com.example.seethroughapp.viewmodel.SeeThroughViewModel;

import java.util.List;

public class IngredientsActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private IngredientAdapter ingredientAdapter;
    private SeeThroughViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ingredients);

        recyclerView = findViewById(R.id.recyclerViewIngredients);
        recyclerView.setLayoutManager(new GridLayoutManager(this, 2));

        viewModel = new ViewModelProvider(this).get(SeeThroughViewModel.class);
        viewModel.getIngredients().observe(this, this::updateIngredients);

        viewModel.fetchIngredients(100);
    }

    private void updateIngredients(List<Ingredient> ingredients) {
        ingredientAdapter = new IngredientAdapter(ingredients);
        recyclerView.setAdapter(ingredientAdapter);
    }
}
