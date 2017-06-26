const assert = require("assert");
const fs = require("fs");
const CoreData = require("js-core-data");
const supertest = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

const lib = require("../index");
const seed = require("./seed");

const database = new CoreData("sqlite://:memory:", { logging: false });
database.createModelFromYaml(fs.readFileSync(__dirname + "/schema.yml"));

const app = express();
app.use(bodyParser.json());
app.use(lib.rest(database));

const test = supertest(app);

describe("rest", () => {
  beforeEach(() => {
    return seed(database);
  });

  describe("collections", () => {
    it("should get companies", () => {
      return test.get(`/companies`).expect(206).then(res => {
        assert.equal(res.headers["content-range"], "items 0-2/3");
        assert.equal(res.body.length, 3);
      });
    });
    it("should get companies limit", () => {
      return test.get(`/companies?limit=2`).expect(206).then(res => {
        assert.equal(res.headers["content-range"], "items 0-1/3");
        assert.equal(res.body.length, 2);
      });
    });
    it("should get companies limit and offset", () => {
      return test.get(`/companies?offset=1&limit=2`).expect(206).then(res => {
        assert.equal(res.headers["content-range"], "items 1-2/3");
        assert.equal(res.body.length, 2);
      });
    });
    it("should get companies limit and page", () => {
      return test.get(`/companies?page=2&limit=1`).expect(206).then(res => {
        assert.equal(res.headers["content-range"], "items 1-1/3");
        assert.equal(res.body.length, 1);
      });
    });
    it("should get companies", () => {
      return test.get(`/companies`).expect(206).then(res => {
        assert.equal(res.body.length, 3);
      });
    });
    it("should get people", () => {
      return test.get(`/people`).expect(206).then(res => {
        assert.equal(res.body.length, 3);
      });
    });
  });

  describe("detail", () => {
    it("should get company detail", () => {
      return test.get(`/companies/1`).expect(200).then(res => {
        assert.ok(res.body.name);
        assert.deepEqual(res.body.employees_id, [3]);
      });
    });

    it("should get preson detail", () => {
      return test.get(`/people/1`).expect(200).then(res => {
        assert.ok(res.body.firstname);
        assert.deepEqual(res.body.company_id, 3);
      });
    });
  });

  describe("patch", () => {
    it("should patch company detail", () => {
      const employees = [1, 2, 3];
      return test
        .patch(`/companies/1`)
        .send({ name: "blah", employees_id: employees })
        .expect(200)
        .then(res => {
          assert.equal(res.body.name, "blah");
          assert.deepEqual(res.body.employees_id, employees);
        });
    });

    it("should patch person detail", () => {
      return test
        .patch(`/people/1`)
        .send({ firstname: "big boss", company_id: 1 })
        .expect(200)
        .then(res => {
          assert.equal(res.body.firstname, "big boss");
          assert.deepEqual(res.body.company_id, 1);
        });
    });
  });

  describe("delete", () => {
    it("should delete company", () => {
      return test.delete(`/companies/1`).expect(201).then(() => {
        return test.get("/companies/1").expect(404);
      });
    });
    it("should delete person", () => {
      return test.delete(`/people/1`).expect(201).then(() => {
        return test.get("/people/1").expect(404);
      });
    });
  });
});
