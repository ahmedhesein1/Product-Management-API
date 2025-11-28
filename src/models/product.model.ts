import mongoose, { Schema, Model } from 'mongoose';
import { ProductAttrs, ProductDoc } from '../types/product.types';

interface ProductModel extends Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
}

const productSchema = new Schema<ProductDoc>(
  {
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      match: /^[A-Za-z0-9\-_]+$/,
      immutable: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      default: null,
      maxlength: 1000,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    type: {
      type: String,
      required: true,
      enum: ['public', 'private'],
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
    discountPrice: {
      type: Number,
      default: null,
      min: 0,
      validate: [
        {
          validator: function (this: ProductDoc, v: number | null) {
            if (v === null) return true;
            return v < this.price;
          } as any,
          message: 'discountPrice must be less than price',
        },
      ],
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
  },
  {
    timestamps: true,
  },
);

// Custom builder (for TS safety)
productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product(attrs);
};

export const Product = mongoose.model<ProductDoc, ProductModel>('Product', productSchema);
