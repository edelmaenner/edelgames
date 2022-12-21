export interface Team{
    id: number
    teamColor: string
    name: string
    spymaster: string | undefined
    investigators: string[]
}