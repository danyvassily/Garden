export interface Post {
  id: string
  sujet: string
  auteur: string
  contenu: string
  date: number
  reactions: Record<string, number>
  reponses: Post[]
}
