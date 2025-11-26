import { Request, Response, NextFunction } from "express";
import Ajv, { JSONSchemaType, ErrorObject } from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, removeAdditional: false });
addFormats(ajv);

const formatAjvErrors = (errors: ErrorObject[] | null | undefined) => {
  if (!errors || errors.length === 0) return [];

  return errors.map((error) => {
    const field = error.instancePath.replace(/^\//, "") || error.params.missingProperty || "unknown";
    
    let message = "";
    
    switch (error.keyword) {
      case "required":
        message = `${error.params.missingProperty} is required`;
        break;
      case "minLength":
        message = `must be at least ${error.params.limit} characters long`;
        break;
      case "maxLength":
        message = `must not exceed ${error.params.limit} characters`;
        break;
      case "pattern":
        message = `must match the required pattern (alphanumeric with hyphens/underscores)`;
        break;
      case "type":
        message = `must be a ${error.params.type}`;
        break;
      case "enum":
        message = `must be one of: ${error.params.allowedValues.join(", ")}`;
        break;
      case "minimum":
        message = `must be greater than or equal to ${error.params.limit}`;
        break;
      case "exclusiveMinimum":
        message = `must be greater than ${error.params.limit}`;
        break;
      case "multipleOf":
        message = `can have maximum 2 decimal places`;
        break;
      case "additionalProperties":
        message = `unknown field: ${error.params.additionalProperty}`;
        break;
      default:
        message = error.message || "invalid value";
    }

    return {
      field: field || error.params.missingProperty,
      message,
    };
  });
};

export const validateSchema = <T>(schema: JSONSchemaType<T>) => {
  const validate = ajv.compile(schema);

  return (req: Request, res: Response, next: NextFunction) => {
    const valid = validate(req.body);

    if (!valid) {
      const errors = formatAjvErrors(validate.errors);
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: {
          code: "VALIDATION_ERROR",
          details: errors,
        },
      });
    }

    return next();
  };
};