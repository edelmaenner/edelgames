export enum Category {
    "bomb",
    "neutral",
    "team"
}

export interface BoardElement{
    word: string
    category: Category
    teamId: number
    categoryVisibleForEveryone: boolean
    marked: boolean
}