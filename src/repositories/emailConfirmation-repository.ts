import {EmailConfirmationScheme} from "../schemes/emailConfirm-scheme";
import {EmailConfirmationConstructor} from "../types/emailConfirmation-constructor";

export class EmailConfirmationRepository {
    async createEmailConfirmation(emailConfirmation: EmailConfirmationConstructor) {
        try {
            await EmailConfirmationScheme.create(emailConfirmation)
            return emailConfirmation
        } catch (e) {
            return null
        }
    }

    async giveEmailConfirmationByCodeOrId(codeOrId: string): Promise<EmailConfirmationConstructor | null> {
        return EmailConfirmationScheme
            .findOne({$or: [{confirmationCode: codeOrId}, {id: codeOrId}]},
                {projection:{_id: false}})
    }

    async updateConfirmationCode(id: string, confirmationCode: string, newExpirationDate?: Date) {
        let result = await EmailConfirmationScheme
            .updateOne({id}, {$set: {confirmationCode, newExpirationDate}})

        return result.modifiedCount === 1
    }

    async updateConfirmationInfo(id: string) {
        let result = await EmailConfirmationScheme
            .updateOne({id}, {$set: {isConfirmed: true}})

        return result.modifiedCount === 1
    }

    async deleteAllEmailConfirmation(): Promise<boolean> {
        try {
            await EmailConfirmationScheme.deleteMany({})
            return true
        } catch (e) {
            console.log('EmailConfirmationScheme => deleteAll =>', e)
            return false
        }
    }
}

export const emailConfirmationRepository = new EmailConfirmationRepository()