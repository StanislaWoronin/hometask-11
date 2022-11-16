import {Request, Response} from "express";
import {BlogsRepository} from "../repositories/blogs-repository";
import {CommentsRepository} from "../repositories/comments-repository";
import {EmailConfirmationRepository} from "../repositories/emailConfirmation-repository";
import {IpAddressRepository} from "../repositories/ipAddress-repository";
import {JWTBlackList} from "../repositories/jwtBlackList";
import {LikesInfoRepository} from "../repositories/likesInfo-repository";
import {PostsRepository} from "../repositories/posts-repository";
import {SecurityRepository} from "../repositories/security-repository";
import {UserLikesRepository} from "../repositories/userLikes-repositiry";
import {UsersRepository} from "../repositories/users-repository";

export class TestingController {
    constructor(protected blogsRepository: BlogsRepository,
                protected commentsRepository: CommentsRepository,
                protected emailConfirmationRepository: EmailConfirmationRepository,
                protected ipAddressRepository: IpAddressRepository,
                protected jwtBlackList: JWTBlackList,
                protected likesInfoRepository: LikesInfoRepository,
                protected postsRepository: PostsRepository,
                protected securityRepository: SecurityRepository,
                protected userLikesRepository: UserLikesRepository,
                protected usersRepository: UsersRepository) {}

    async deleteAll(req: Request, res: Response) {
        try {
            await this.blogsRepository.deleteAllBlogs()
            await this.commentsRepository.deleteAllComments()
            await this.emailConfirmationRepository.deleteAllEmailConfirmation()
            await this.ipAddressRepository.deleteAll()
            await this.jwtBlackList.deleteAll()
            await this.likesInfoRepository.deleteAll(),
            await this.postsRepository.deleteAllPosts()
            await this.securityRepository.deleteAll()
            await this.userLikesRepository.deleteAll()
            await this.usersRepository.deleteAllUsers()

            return res.sendStatus(204)
        } catch (e) {
            console.log('testingRouter => all-data =>', e)
            return res.sendStatus(503)
        }
    }
}