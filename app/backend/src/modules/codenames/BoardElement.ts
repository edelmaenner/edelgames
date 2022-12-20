enum Category {
    "bomb",
    "neutral",
    "team"
}

export class BoardElement{
    word: string
    category: Category
    teamName: string
    categoryVisibleForEveryone: Boolean
}