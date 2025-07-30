import { column, defineDb, defineTable } from 'astro:db'

const User = defineTable({
  columns: {
    id: column.text({ primary: true, unique: true }),
    name: column.text(),
    email: column.text({ unique: true }),
    password: column.text(),
    createdAt: column.date({ default: new Date() }),
    role: column.text({ references: () => Role.columns.id }),
  },
})

const Role = defineTable({
  columns: {
    id: column.text({ primary: true, unique: true }),
    name: column.text(),
  },
})

export default defineDb({
  tables: {
    User,
    Role,
  },
})
