import { ae as createSsrRpc } from "./router-CnaK_EO9.js";
import { a0 as createServerFn } from "../server.js";
import { o as objectType, s as stringType } from "./client.server-C7GAOqxY.js";
import "./adminHelpers.server-BhLg7GIA.js";
import "node:async_hooks";
import "node:stream";
import "node:stream/web";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const emailSchema = stringType().trim().toLowerCase().email().max(255);
const passwordSchema = stringType().min(4).max(200);
const registerCustomerFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  name: stringType().trim().min(1).max(255),
  email: emailSchema,
  phone: stringType().trim().max(50).default(""),
  password: passwordSchema,
  address: stringType().trim().max(500).optional()
}).parse(input)).handler(createSsrRpc("174d847d55767cfb0d892cff8e85ce14b3d79f59b30a3e291c98c582d2414603"));
const loginCustomerFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  email: emailSchema,
  password: passwordSchema
}).parse(input)).handler(createSsrRpc("8604b5cecd71f15457357c699dd09ad90b64f100d37df64230d3bc2189fd84ac"));
const updateCustomerPasswordFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  customerId: stringType().uuid(),
  newPassword: passwordSchema
}).parse(input)).handler(createSsrRpc("c1c95c518bfe5af322b5e90e2a0138419fb97cbe0ffd727b89b6df943c0efffe"));
const registerAffiliateFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  name: stringType().trim().min(1).max(255),
  email: emailSchema,
  phone: stringType().trim().max(50).default(""),
  password: passwordSchema
}).parse(input)).handler(createSsrRpc("43b15be3692b942479d3eddde98ba7a1cd4c46dcf77ca7fe37b622c0a718c2f0"));
const loginAffiliateFn = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  email: emailSchema,
  password: passwordSchema
}).parse(input)).handler(createSsrRpc("c3eafd934224d4d365e321f607272e3f3de0665d8c2496f50f20dcbf3e5da7d2"));
export {
  loginAffiliateFn,
  loginCustomerFn,
  registerAffiliateFn,
  registerCustomerFn,
  updateCustomerPasswordFn
};
