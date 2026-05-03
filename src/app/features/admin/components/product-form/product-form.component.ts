import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { AdminProductService } from '../../services/admin-product.service';
import { Product, ProductCategory, Gender } from '../../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductFormComponent implements OnInit {
  /** Route param — present when editing, empty when creating */
  id = input<string>('');

  private readonly fb           = inject(FormBuilder);
  private readonly adminService = inject(AdminProductService);
  private readonly router       = inject(Router);

  readonly isEdit       = signal(false);
  readonly loadingData  = signal(false);   // loading existing product
  readonly saving       = signal(false);   // submitting form
  readonly errors       = signal<string[]>([]);
  readonly categories   = Object.values(ProductCategory);
  readonly genders      = Object.values(Gender);

  /** Currently selected main image file */
  readonly mainImageFile   = signal<File | null>(null);
  /** Preview URL for the main image */
  readonly mainImagePreview = signal<string>('');
  /** Currently selected additional image files */
  readonly additionalFiles = signal<File[]>([]);

  readonly form = this.fb.nonNullable.group({
    name:            ['', [Validators.required]],
    description:     ['', [Validators.required]],
    price:           [0,  [Validators.required, Validators.min(0.01)]],
    discountPrice:   [null as number | null],
    isOnSale:        [false],
    stockQuantity:   [0,  [Validators.required, Validators.min(0)]],
    category:        [ProductCategory.Clothing, [Validators.required]],
    gender:          [Gender.Unisex,            [Validators.required]],
    availableSizes:  [''],
    availableColors: [''],
    brand:           ['', [Validators.required]],
    isFeatured:      [false],
    isActive:        [true],
    tags:            [''],
  });

  ngOnInit(): void {
    const productId = Number(this.id());
    if (productId) {
      this.isEdit.set(true);
      this.loadProduct(productId);
    }
  }

  private loadProduct(id: number): void {
    this.loadingData.set(true);
    this.adminService.getProductById(id).subscribe({
      next: (p: Product) => {
        this.form.patchValue({
          name:            p.name,
          description:     p.description,
          price:           p.price,
          discountPrice:   p.discountPrice ?? null,
          isOnSale:        p.isOnSale,
          stockQuantity:   p.stockQuantity,
          category:        p.category,
          gender:          p.gender,
          availableSizes:  p.availableSizes,
          availableColors: p.availableColors,
          brand:           p.brand,
          isFeatured:      p.isFeatured,
          isActive:        p.isActive,
          tags:            p.tags,
        });
        // Show existing image as preview
        if (p.mainImageUrl) {
          this.mainImagePreview.set(p.mainImageUrl);
        }
        this.loadingData.set(false);
      },
      error: () => {
        this.errors.set(['Failed to load product data.']);
        this.loadingData.set(false);
      },
    });
  }

  onMainImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.mainImageFile.set(file);
    // Generate local preview
    const reader = new FileReader();
    reader.onload = (e) => this.mainImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onAdditionalImagesChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.additionalFiles.set(files);
  }

  removeMainImage(): void {
    this.mainImageFile.set(null);
    this.mainImagePreview.set('');
  }

  setSizesPreset(preset: string): void {
    this.form.controls.availableSizes.setValue(preset);
  }

  setColorsPreset(preset: string): void {
    this.form.controls.availableColors.setValue(preset);
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    // Create mode requires a main image
    if (!this.isEdit() && !this.mainImageFile()) {
      this.errors.set(['Main product image is required.']);
      return;
    }

    this.saving.set(true);
    this.errors.set([]);

    const v = this.form.getRawValue();
    const fd = new FormData();

    // Category and Gender must be sent as numeric enum values (backend uses int enum)
    const categoryToNum: Record<string, number> = {
      Clothing: 0, Footwear: 1, Accessories: 2, Bags: 3,
      Jewelry: 4, Watches: 5, Sportswear: 6, Underwear: 7,
      Outerwear: 8, Other: 9,
    };
    const genderToNum: Record<string, number> = {
      Men: 0, Women: 1, Unisex: 2, Kids: 3, Baby: 4,
    };

    // Append all text fields
    fd.append('name',            v.name);
    fd.append('description',     v.description);
    fd.append('price',           String(v.price));
    fd.append('stockQuantity',   String(v.stockQuantity));
    fd.append('category',        String(categoryToNum[v.category] ?? 0));
    fd.append('gender',          String(genderToNum[v.gender] ?? 2));
    fd.append('brand',           v.brand);
    fd.append('isOnSale',        String(v.isOnSale));
    fd.append('isFeatured',      String(v.isFeatured));
    fd.append('isActive',        String(v.isActive));
    fd.append('availableSizes',  v.availableSizes);
    fd.append('availableColors', v.availableColors);
    fd.append('tags',            v.tags);
    if (v.discountPrice !== null && v.discountPrice !== undefined) {
      fd.append('discountPrice', String(v.discountPrice));
    }

    // Append image files
    const mainFile = this.mainImageFile();
    if (mainFile) {
      fd.append('mainImage', mainFile, mainFile.name);
    }
    this.additionalFiles().forEach(f => fd.append('additionalImages', f, f.name));

    const req$: Observable<unknown> = this.isEdit()
      ? this.adminService.updateProduct(Number(this.id()), fd)
      : this.adminService.createProduct(fd);

    req$.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/products']);
      },
      error: (err: unknown) => {
        const apiErrors = (err as { error?: { errors?: string[] } })?.error?.errors;
        this.errors.set(apiErrors ?? ['Failed to save product. Please try again.']);
        this.saving.set(false);
      },
    });
  }

  get f() { return this.form.controls; }
}
