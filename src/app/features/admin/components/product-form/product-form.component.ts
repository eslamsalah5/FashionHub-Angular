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
import { AdminProductService, PRODUCTS_API } from '../../services/admin-product.service';
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
  /** Existing additional image URLs from the server */
  readonly existingAdditionalImages = signal<string[]>([]);
  /** Original relative paths for existing additional images (for deletion) */
  readonly existingAdditionalImagePaths = signal<string[]>([]);
  /** Preview URLs for newly selected additional images */
  readonly additionalImagePreviews = signal<string[]>([]);
  /** Flag to track if the main image was explicitly removed */
  readonly mainImageRemoved = signal(false);
  /** Track which existing additional images should be deleted */
  readonly additionalImagesToDelete = signal<string[]>([]);

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
        // Load existing additional images
        if (p.additionalImageUrls) {
          const paths = p.additionalImageUrls.split(',')
            .map(url => url.trim())
            .filter(Boolean);
          
          // Store original paths for deletion
          this.existingAdditionalImagePaths.set(paths);
          
          // Store resolved URLs for display
          const urls = paths.map(url => this.adminService.resolveImageUrl(url));
          this.existingAdditionalImages.set(urls);
        }
        // Reset the removed flag when loading a product
        this.mainImageRemoved.set(false);
        this.mainImageFile.set(null);
        this.additionalFiles.set([]);
        this.additionalImagePreviews.set([]);
        this.additionalImagesToDelete.set([]);
        this.existingAdditionalImagePaths.set([]);
        console.log('📦 Product loaded, mainImageRemoved reset to false');
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
    this.mainImageRemoved.set(false);
    console.log('📸 New main image selected, mainImageRemoved set to false');
    // Generate local preview
    const reader = new FileReader();
    reader.onload = (e) => this.mainImagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  onAdditionalImagesChange(event: Event): void {
    const files = Array.from((event.target as HTMLInputElement).files ?? []);
    this.additionalFiles.set(files);
    
    // Generate previews for new files
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        if (previews.length === files.length) {
          this.additionalImagePreviews.set(previews);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (files.length === 0) {
      this.additionalImagePreviews.set([]);
    }
  }

  removeExistingAdditionalImage(url: string): void {
    // Find the index of the URL to get the corresponding path
    const index = this.existingAdditionalImages().indexOf(url);
    if (index !== -1) {
      const path = this.existingAdditionalImagePaths()[index];
      const current = this.additionalImagesToDelete();
      this.additionalImagesToDelete.set([...current, path]);
      console.log('🗑️ Marked additional image for deletion:', path);
    }
  }

  removeNewAdditionalImage(index: number): void {
    const files = this.additionalFiles();
    const previews = this.additionalImagePreviews();
    this.additionalFiles.set(files.filter((_, i) => i !== index));
    this.additionalImagePreviews.set(previews.filter((_, i) => i !== index));
  }

  removeMainImage(): void {
    this.mainImageFile.set(null);
    this.mainImagePreview.set('');
    this.mainImageRemoved.set(true);
    console.log('🗑️ Main image removed, mainImageRemoved set to true');
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
    fd.append('Name',            v.name);
    fd.append('Description',     v.description);
    fd.append('Price',           String(v.price));
    fd.append('StockQuantity',   String(v.stockQuantity));
    fd.append('Category',        String(categoryToNum[v.category] ?? 0));
    fd.append('Gender',          String(genderToNum[v.gender] ?? 2));
    fd.append('Brand',           v.brand);
    fd.append('IsOnSale',        v.isOnSale ? 'true' : 'false');
    fd.append('IsFeatured',      v.isFeatured ? 'true' : 'false');
    fd.append('IsActive',        v.isActive ? 'true' : 'false');
    fd.append('AvailableSizes',  v.availableSizes);
    fd.append('AvailableColors', v.availableColors);
    fd.append('Tags',            v.tags);
    
    // Always send ClearMainImage flag (not just when true)
    fd.append('ClearMainImage', this.mainImageRemoved() ? 'true' : 'false');
    
    if (v.discountPrice !== null && v.discountPrice !== undefined) {
      fd.append('DiscountPrice', String(v.discountPrice));
    }

    // Append image files
    const mainFile = this.mainImageFile();
    if (mainFile) {
      fd.append('MainImage', mainFile, mainFile.name);
      console.log('📸 New main image attached:', mainFile.name);
    }
    
    // Append new additional images
    this.additionalFiles().forEach(f => {
      fd.append('AdditionalImages', f, f.name);
      console.log('🖼️ New additional image attached:', f.name);
    });
    
    // Append list of additional images to delete
    this.additionalImagesToDelete().forEach(url => {
      fd.append('DeleteAdditionalImages', url);
      console.log('🗑️ Additional image marked for deletion:', url);
    });

    // Debug: Log FormData contents
    console.log('📤 Submitting product update to:', `${this.adminService.getBaseUrl()}${PRODUCTS_API}/${this.id()}`);
    console.log('  - ClearMainImage:', this.mainImageRemoved() ? 'true' : 'false');
    console.log('  - MainImageFile:', mainFile?.name || 'none');
    
    // Log all FormData entries
    console.log('📋 FormData entries:');
    fd.forEach((value, key) => {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });

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
