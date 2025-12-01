// src/models/RequestType.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const RequestType = sequelize.define(
  "RequestType",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "request_types",
    timestamps: false, // tu tabla no usa created_at ni updated_at
  }
);
