import { JSONSchemaType } from "ajv";
import {
  CreateProductInput,
  UpdateProductInput,
} from "../types/product.types";

export const createProductSchema: JSONSchemaType<CreateProductInput> = {
  type: "object",
  required: [
    "sku",
    "name",
    "category",
    "type",
    "price",
    "quantity",
  ],
  properties: {
    sku: {
      type: "string",
      minLength: 3,
      maxLength: 50,
      pattern: "^[A-Za-z0-9_-]+$",
    },
    name: {
      type: "string",
      minLength: 3,
      maxLength: 200,
    },
    description: {
      type: "string",
      maxLength: 1000,
      nullable: true,
    },
    category: {
      type: "string",
      minLength: 2,
      maxLength: 100,
    },
    type: {
      type: "string",
      enum: ["public", "private"],
    },
    price: {
      type: "number",
      exclusiveMinimum: 0,
      multipleOf: 0.01,
    },
    discountPrice: {
      type: "number",
      minimum: 0,
      nullable: true,
    },
    quantity: {
      type: "integer",
      minimum: 0,
    },
  },
  additionalProperties: false,
};

export const updateProductSchema: JSONSchemaType<UpdateProductInput> = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 3,
      maxLength: 200,
      nullable: true,
    },
    description: {
      type: "string",
      maxLength: 1000,
      nullable: true,
    },
    category: {
      type: "string",
      minLength: 2,
      maxLength: 100,
      nullable: true,
    },
    type: {
      type: "string",
      enum: ["public", "private"],
      nullable: true,
    },
    price: {
      type: "number",
      exclusiveMinimum: 0,
      multipleOf: 0.01,
      nullable: true,
    },
    discountPrice: {
      type: "number",
      minimum: 0,
      nullable: true,
    },
    quantity: {
      type: "integer",
      minimum: 0,
      nullable: true,
    },
  },
  required: [],
  additionalProperties: false,
};