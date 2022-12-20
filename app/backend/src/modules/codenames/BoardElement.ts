export enum Category {
    "bomb",
    "neutral",
    "team"
}

export class BoardElement{
    word: string
    category: Category
    teamName: string
    categoryVisibleForEveryone: Boolean
    marked: Boolean

    constructor(
        word: string, category: Category, teamName: string, categoryVisibleForEveryone: Boolean = false,
        marked: Boolean = false
    ) {
        this.word = word
        this.category = category
        this.teamName = teamName
        this.categoryVisibleForEveryone = categoryVisibleForEveryone
        this.marked = marked
    }

}