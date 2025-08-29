import { Router } from "express";
import {
  createContact,
  getallContacts,
  getOneContact,
} from "../controllers/contactusController.js";

const routes = Router();

routes.get("/", getallContacts);
routes.post("/create", createContact);
routes.get("/get/:contactId", getOneContact);

export default routes;
