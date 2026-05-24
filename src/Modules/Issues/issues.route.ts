import { Router } from "express";
import { issuesController } from "./issues.controller";
import auth from "../../middleware/auth";

const router = Router()
const USER_ROLE={
    contributor:"contributor",
    maintainer:"maintainer"
} as const
router.post("/",auth(USER_ROLE.contributor,USER_ROLE.maintainer),issuesController.createIssues)
router.get("/:id",issuesController.createIssueControllersSingle)
router.get("/", issuesController.createIssueControllerAll);
router.patch("/:id",auth(USER_ROLE.contributor,USER_ROLE.maintainer),issuesController.patchIssueController)
router.delete("/:id", auth(USER_ROLE.maintainer), issuesController.deleteIssueController) 
export const issuesRouter =router 