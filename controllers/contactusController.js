import { ContactUs } from "../models/ContactUsMode.js";
import { contactValidator } from "../middlewares/validators/contactValidators.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { successMessage } from "../utils/successMessage.js";

export const getallContacts = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, message, sort } = req.query;
  const queryObj = {};

  if (firstName) {
    queryObj.firstName = { $regex: firstName, $options: "i" };
  }

  if (lastName) {
    queryObj.lastName = { $regex: lastName, $options: "i" };
  }

  if (email) {
    queryObj.email = { $regex: email, $options: "i" };
  }

  if (message) {
    queryObj.message = { $regex: message, $options: "i" };
  }

  // sorting options
  const sortOptions = {
    new: "-createdAt",
    old: "createdAt",
  };
  const sortKey = sortOptions[sort] || sortOptions.new;

  // pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const contacts = await ContactUs.find(queryObj)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalDocs = await ContactUs.countDocuments(queryObj);
  const numOfPages = Math.ceil(totalDocs / limit);

  res.status(200).json({
    status: "success",
    length: contacts.length,
    message: "all contacts found",
    data: {
      totalDocs,
      currentPage: page,
      numOfPages,
      contacts,
    },
  });
});

// create contacts
export const createContact = catchAsync(async (req, res, next) => {
  const { error } = contactValidator(req.body);
  if (error) return next(new AppError(error?.details[0]?.message, 400));

  const { firstName, lastName, email, message } = req.body;

  const contact = await ContactUs.create({
    firstName,
    lastName,
    email,
    message,
  });
  if (!contact) return next(new AppError("contact not created", 400));

  successMessage(res, 200, "success", "contact created", contact);
});

// get one contacts
export const getOneContact = catchAsync(async (req, res, next) => {
  const id = req.params.contactId;
  const contact = await ContactUs.findById(id);
  if (!contact) return next(new AppError("Contact not found", 400));

  successMessage(res, 200, "success", "contact found successfully", contact);
});
