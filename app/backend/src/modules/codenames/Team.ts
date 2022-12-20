export class Team{
    name: string
    spymaster: string
    investigators: string[]

    constructor(name: string) {
        this.name = name;
        this.investigators = []
    }

    contains(user: string):Boolean{
        if(this.investigators.indexOf(user) > -1){
            return true
        }else return this.spymaster === user;
    }

    addInvestigators(user:string){
        if(this.spymaster === user){
            this.spymaster = undefined
        }
        if(!this.contains(user)){
            this.investigators.push(user)
        }
    }

    setSpymaster(user:string){
        if(this.spymaster !== user){
            if (this.spymaster !== undefined)
                this.addInvestigators(this.spymaster);

            this.removePlayer(user);
            this.spymaster = user
        }
    }

    removePlayer(user:string){
        if(user === this.spymaster){
            this.spymaster = undefined
        }else{
            this.investigators = this.investigators.filter(member => member !== user)
        }
    }


}