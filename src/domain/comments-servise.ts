import {v4 as uuidv4} from 'uuid';
import {CommentsRepository} from "../repositories/comments-repository";
import {CommentBDConstructor, CommentConstructor} from "../types/comment-constructor";
import {ContentPageConstructor} from "../types/contentPage-constructor";
import {LikesInfoConstructor} from "../types/likesInfo-constructor";
import {UserDBConstructor} from "../types/user-constructor";
import {paginationContentPage} from "../paginationContentPage";
import {commentOutputType} from "../dataMapping/toCommentOutputData";
import {LikesInfoRepository} from "../repositories/likesInfo-repository";
import {UserLikesRepository} from "../repositories/userLikes-repositiry";
import {getCommentsForNotAuthorisationUserOutputData} from "../dataMapping/getCimmentForNotAuthUserOutputData";

export class CommentsService {
    constructor(protected commentsRepository: CommentsRepository,
                protected likesInfoRepository: LikesInfoRepository,
                protected userLikesRepository: UserLikesRepository) {}

    async createNewComment(postId: string, comment: string, user: UserDBConstructor): Promise<CommentConstructor | null> {
        const commentId = uuidv4()

        const likesInfo = new LikesInfoConstructor(
            commentId,
            'None',
            0,
            0
        )

        const newComment = new CommentBDConstructor(
            commentId,
            comment,
            user.id,
            user.login,
            new Date().toISOString(),
            likesInfo,
            postId
        )

        const createdComment = await this.commentsRepository.createNewComment(newComment)
        await this.likesInfoRepository.createLikeInfo(likesInfo)

        if (!createdComment) {
            return null
        }

        return getCommentsForNotAuthorisationUserOutputData(createdComment)
    }

    async updateComment(commentId: string, comment: string): Promise<boolean> {
        return await this.commentsRepository.updateComment(commentId, comment)
    }

    async giveCommentById(commentId: string): Promise<CommentConstructor | null> {

        const comment = await this.commentsRepository.giveCommentById(commentId)

        if (!comment) {
            return null
        }

        return commentOutputType(comment)
    }

    async giveCommentsPage(sortBy: string,
                           sortDirection: 'asc' | 'desc',
                           pageNumber: string,
                           pageSize: string,
                           postId: string): Promise<ContentPageConstructor | null> {

        const commentsDB = await this.commentsRepository.giveComments(sortBy, sortDirection, pageNumber, pageSize, postId)

        if (!commentsDB!.length) {
            return null
        }

        const comments = commentsDB!.map(c => commentOutputType(c))
        const totalCount = await this.commentsRepository.giveTotalCount(postId)

        return paginationContentPage(pageNumber, pageSize, comments, totalCount)
    }

    async giveComment(commentId: string) {
        return this.commentsRepository.giveCommentById(commentId)
    }

    async updateLikesInfo(userId: string, commentId: string, likeStatus: string) {
        const commentReacted = await this.userLikesRepository.giveUserLike(userId, commentId)
        console.log('-----> commentReacted: ' + commentReacted)
        if (!commentReacted) {
            await this.userLikesRepository.addUserReact(userId, commentId, likeStatus)
        }

        if (likeStatus === 'None') {
            await this.userLikesRepository.updateUserLikeStatus(userId, likeStatus)

            let field = 'dislikesCount'
            if (commentReacted!.likeStatus === 'Like') {
                field = 'likesCount'
            }

            await this.likesInfoRepository.removeLikeOrDislike(commentId, field)
        } else {
            let field = 'dislikesCount'
            if (likeStatus === 'Like') {
                field = 'likesCount'
            }

            await this.likesInfoRepository.updateLikeOrDislikeCount(commentId, field)
        }

        return true
    } // TODO остановился здесь

    async deleteCommentById(commentId: string): Promise<boolean> {
        return await this.commentsRepository.deleteCommentById(commentId)
    }
}