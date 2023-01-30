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
    marks: string[]

    constructor(
        word: string, category: Category, teamName: string, categoryVisibleForEveryone: Boolean = false,
        marks: string[] = []
    ) {
        this.word = word
        this.category = category
        this.teamName = teamName
        this.categoryVisibleForEveryone = categoryVisibleForEveryone
        this.marks = marks
    }

}