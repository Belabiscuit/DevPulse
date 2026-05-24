
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    

// src/app.ts
import express from "express";

// src/Modules/user/user.route.ts
import { Router } from "express";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  conection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.conection_string
});
var DataBase = async () => {
  try {
    await pool.query(`
            
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            email VARCHAR(50) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()

           

            )
`);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS issues(
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL CHECK(LENGTH(description)>=20),
        type VARCHAR(30) NOT NULL CHECK(type IN ('bug', 'feature_request')),
         status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT NOT NULL,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()

       )
        
 

        `);
    console.log("Database connected successfully!!");
  } catch (error) {
    console.log(error);
  }
};

// src/Modules/user/user.service.ts
import bcrypt from "bcrypt";
var serviceRegistration = async (payload) => {
  const { name, email, password, role } = payload;
  const hassPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
        
        INSERT INTO users(name,email,password,role) VALUES ($1,$2,$3,$4)
        RETURNING *
        `, [name, email, hassPassword, role]);
  delete result.rows[0].password;
  return result;
};
var userService = {
  serviceRegistration
};

// src/Modules/user/user.controller.ts
var userRegistration = async (req, res) => {
  try {
    const result = await userService.serviceRegistration(req.body);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      error
    });
  }
};
var userController = {
  userRegistration
};

// src/Modules/user/user.route.ts
var router = Router();
router.post("/signup", userController.userRegistration);
var userRouter = router;

// src/Modules/Auth/auth.route.ts
import { Router as Router2 } from "express";

// src/Modules/Auth/auth.service.ts
import bcrypt2 from "bcrypt";
import jwt from "jsonwebtoken";
var loginServices = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("User Not Found!!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt2.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid Credintials!!");
  }
  const jwtPayload = {
    id: Number(user.id),
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(jwtPayload, config_default.secret, { expiresIn: "1d" });
  delete user.password;
  return {
    token: accessToken,
    user
  };
};
var authServices = {
  loginServices
};

// src/Modules/Auth/auth.controller.ts
var loginUser = async (req, res) => {
  try {
    const result = await authServices.loginServices(req.body);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token: result.token,
        user: result.user
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: {}
    });
  }
};
var authController = {
  loginUser
};

// src/Modules/Auth/auth.route.ts
var router2 = Router2();
router2.post("/", authController.loginUser);
var authRouter = router2;

// src/Modules/Issues/issues.route.ts
import { Router as Router3 } from "express";

// src/Modules/Issues/issues.service.ts
var createServiceIssue = async (payload, reporterId) => {
  const { title, description, type } = payload;
  const result = await pool.query(`
       INSERT INTO issues (title,description,type,reporter_id) VALUES ($1,$2,$3,$4) 
       RETURNING *
        `, [title, description, type, reporterId]);
  return result.rows[0];
};
var createServiceIssueSingle = async (id) => {
  const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1
        
        `, [id]);
  return result;
};
var createAllIssues = async (sort, type, status) => {
  const order = sort === "oldest" ? "ASC" : "DESC";
  const conditions = [];
  const values = [];
  let index = 1;
  if (type) {
    conditions.push(`type = $${index++}`);
    values.push(type);
  }
  if (status) {
    conditions.push(`status = $${index++}`);
    values.push(status);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const issuesResult = await pool.query(
    `SELECT * FROM issues ${whereClause} ORDER BY created_at ${order}`,
    values
  );
  const issues = issuesResult.rows;
  if (issues.length === 0) {
    throw new Error("No issues found");
  }
  const allReporterIds = issues.map((issue) => issue.reporter_id);
  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [allReporterIds]
  );
  const usersMap = {};
  usersResult.rows.forEach((user) => {
    usersMap[user.id] = user;
  });
  const data = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: usersMap[issue.reporter_id] || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  }));
  return data;
};
var createServicePatch = async (id, userID, role, payload) => {
  const { title, description, type } = payload;
  const issueSearch = await pool.query(`
            SELECT *FROM issues WHERE id=$1
        
        
        
        `, [id]);
  if (issueSearch.rows.length === 0) {
    throw new Error("Issue not Found");
  }
  if (role === "contributor" && userID !== issueSearch.rows[0].reporter_id) {
    throw new Error("unathorized Access!");
  }
  if (role === "contributor" && issueSearch.rows[0].status != "open") {
    throw new Error("On going!");
  }
  const result = await pool.query(`UPDATE issues
         SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         type = COALESCE($3, type),
         status = 'in_progress',
         updated_at = NOW()
         WHERE id = $4
         RETURNING *
            
            `, [title, description, type, id]);
  return result;
};
var createServiceDelete = async (id) => {
  const issueSearch = await pool.query(
    `SELECT * FROM issues WHERE id=$1`,
    [id]
  );
  if (issueSearch.rows.length === 0) {
    throw new Error("Issue Not Found!");
  }
  await pool.query(
    `DELETE FROM issues WHERE id=$1`,
    [id]
  );
};
var serviceIssues = {
  createServiceIssue,
  createServiceIssueSingle,
  createAllIssues,
  createServicePatch,
  createServiceDelete
};

// src/Modules/Issues/issues.controller.ts
var createIssues = async (req, res) => {
  const user = req.user;
  const reporterId = user.id;
  try {
    const result = await serviceIssues.createServiceIssue(req.body, reporterId);
    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: {}
    });
  }
};
var createAllIssuesController = async (req, res) => {
  try {
    const { sort, type, status } = req.query;
    const result = await serviceIssues.createAllIssues(
      sort,
      type,
      status
    );
    return res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};
var createIssueControllersSingle = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await serviceIssues.createServiceIssueSingle(Number(id));
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Not Found!"
      });
    }
    res.status(200).json({
      success: true,
      message: "Issue retrieved successfully",
      data: result.rows[0]
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
      error
    });
  }
};
var patchIssueController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: userID } = req.user;
    const result = await serviceIssues.createServicePatch(Number(id), userID, role, req.body);
    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
var deleteIssueController = async (req, res) => {
  const { id } = req.params;
  try {
    await serviceIssues.createServiceDelete(Number(id));
    res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      error: {}
    });
  }
};
var issuesController = {
  createIssues,
  createIssueControllersSingle,
  createAllIssuesController,
  patchIssueController,
  deleteIssueController
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized Access"
        });
      }
      const decoded = jwt2.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `SELECT * FROM users WHERE id=$1`,
        [decoded.id]
      );
      if (userData.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Not Founded!"
        });
      }
      const user = userData.rows[0];
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or Expired Token"
      });
    }
  };
};
var auth_default = auth;

// src/Modules/Issues/issues.route.ts
var router3 = Router3();
var USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer"
};
router3.post("/", auth_default(), issuesController.createIssues);
router3.get("/:id", issuesController.createIssueControllersSingle);
router3.get("/", issuesController.createAllIssuesController);
router3.patch("/:id", auth_default(USER_ROLE.contributor, USER_ROLE.maintainer), issuesController.patchIssueController);
router3.delete("/:id", auth_default(USER_ROLE.maintainer), issuesController.deleteIssueController);
var issuesRouter = router3;

// src/app.ts
var app = express();
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", userRouter);
app.use("/api/auth/login", authRouter);
app.use("/api/issues", issuesRouter);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Express Server",
    "author": "Sifa-t"
  });
});
var app_default = app;

// src/server.ts
var main = () => {
  DataBase();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map