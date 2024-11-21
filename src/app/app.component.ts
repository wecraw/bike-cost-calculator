import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  bikeForm: FormGroup;
  progress: number = 0;
  bikeCost: number = 0;
  dailySavings: number = 0;
  progressPercentage: number = 0;
  overrideDays: number = 0; // Allows manual override for days

  constructor(private fb: FormBuilder) {
    this.bikeForm = this.fb.group({
      bikeCost: [null],
      gasPrice: [null],
      distance: [null],
      mpg: [null],
      tolls: [null],
    });
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const savedFormValues = localStorage.getItem('bikeFormValues');
      const savedProgress = localStorage.getItem('bikeProgress');
      const savedOverrideDays = localStorage.getItem('overrideDays');

      if (savedFormValues) {
        this.bikeForm.setValue(JSON.parse(savedFormValues));
      }
      if (savedProgress) {
        this.progress = parseFloat(savedProgress);
      }
      if (savedOverrideDays) {
        this.overrideDays = parseInt(savedOverrideDays, 10);
      }

      this.bikeForm.valueChanges.subscribe((values) => {
        localStorage.setItem('bikeFormValues', JSON.stringify(values));
        this.calculateDailySavings();
        this.updateProgressPercentage();
      });
    }
  }

  addDayOfProgress() {
    if (this.dailySavings > 0) {
      this.overrideDays++;
      this.progress += this.dailySavings;
      localStorage.setItem('bikeProgress', this.progress.toString());
      localStorage.setItem('overrideDays', this.overrideDays.toString());
      this.updateProgressPercentage();
    }
  }

  updateOverrideDays() {
    if (this.overrideDays >= 0) {
      this.progress = this.overrideDays * this.dailySavings;
      localStorage.setItem('bikeProgress', this.progress.toString());
      localStorage.setItem('overrideDays', this.overrideDays.toString());
      this.updateProgressPercentage();
    }
  }

  private calculateDailySavings() {
    const { gasPrice, distance, mpg, tolls } = this.bikeForm.value;
    if (gasPrice && distance && mpg && tolls) {
      this.dailySavings = (distance / mpg) * gasPrice + tolls;
      this.updateProgressPercentage();
    }
  }

  private updateProgressPercentage() {
    this.bikeCost = this.bikeForm.value.bikeCost || 0;
    if (this.bikeCost > 0) {
      this.progressPercentage = Math.min(
        (this.progress / this.bikeCost) * 100,
        100
      );
    }
  }
}
