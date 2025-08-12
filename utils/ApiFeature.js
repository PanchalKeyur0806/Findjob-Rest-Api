import { parse } from "dotenv";

class ApiFeature {
  constructor(query, queryString, searchFields = []) {
    this.query = query;
    this.queryString = queryString;
    this.filterObj = {};
    this.page = 1;
    this.limit = 10;
    this.searchFields = searchFields;
  }

  search() {
    if (this.queryString.q && this.searchFields.length > 0) {
      const regex = { $regex: this.queryString.q, $options: "i" };

      const searchFilter = {
        $or: this.searchFields.map((field) => {
          if (field.includes(".")) {
            return { [field]: regex };
          }

          return { [field]: regex };
        }),
      };

      this.filterObj = { ...this.filterObj, ...searchFilter };
      this.query = this.query.find(searchFilter);
    }

    return this;
  }

  filter() {
    const filterCopy = { ...this.queryString };
    const excludedKeys = ["page", "limit", "sort", "fields", "q"];
    excludedKeys.forEach((ele) => delete filterCopy[ele]);

    // transforming query
    // create  a new object
    const transformedQuery = {};
    // search through the filterCopy obj
    for (const key in filterCopy) {
      // fine the mognodb operator by using regex
      const operatorMatch = key.match(/^(.+)\[(gte|gt|lte|lt|in|ne)\]$/);

      // if operator is found
      if (operatorMatch) {
        // fetch the field, operator and value from the operatorMatch
        const field = operatorMatch[1];
        const operator = operatorMatch[2];
        const value = isNaN(filterCopy[key])
          ? filterCopy[key]
          : Number(filterCopy[key]);

        if (!transformedQuery[field]) {
          transformedQuery[field] = {};
        }

        transformedQuery[field][`$${operator}`] = value;
      } else {
        transformedQuery[key] = filterCopy[key];
      }
    }

    this.query = this.query.find(transformedQuery);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");

      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    this.page = parseInt(this.queryString.page) || 1;
    this.limit = parseInt(this.queryString.limit) || 10;
    const skip = (this.page - 1) * this.limit;

    this.query = this.query.skip(skip).limit(this.limit);
    return this;
  }
}

export default ApiFeature;
