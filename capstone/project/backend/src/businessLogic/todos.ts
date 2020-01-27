/**
 * This file specifies Business Layer functions for TODO functions
 * All functions here call the Data Layer functions soas to improve
 * code portability
 */

import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'

// Instantiate objects 
const todoAccess = new TodoAccess()

/**
 * @description Returns a list of all TODO items in the table
 * @returns All items in the table
 */
export async function getTodoList(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken);
  return todoAccess.getTodoList(userId);
}

/**
 * @description Creates a TODO item and inserts it into the table
 * @param createTodoRequest Fields inserted: name, dueDate
 * @param jwtToken Authorization token
 * @returns TodoItem
 */
export async function createTodoItem(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string): Promise<TodoItem> 
{
  // const bucketName = process.env.TODO_IMAGE_BUCKET;
  const itemId = uuid.v4();
  const userId = parseUserId(jwtToken);
  const item = await todoAccess.createTodoItem(
    {
      userId,
      todoId: itemId,
      createdAt: new Date().toISOString(),
      name: createTodoRequest.name,
      dueDate: createTodoRequest.dueDate,
      done: false//,
      // attachmentUrl: `https://${bucketName}.s3.amazonaws.com/${itemId}`
    });
  return item;
}
/**
 * @description Updates an item in the table 
 * @param updateTodoRequest Fields to update: name, dueDate, done
 * @param todoId 
 */
export async function updateTodoItem (
  updateTodoRequest: UpdateTodoRequest,
  todoId: string,
  jwtToken: string)
{
  const userId = parseUserId(jwtToken);
  await todoAccess.updateTodoItem(updateTodoRequest,todoId, userId);
}
/**
 * @description Delete an item from the table
 * @param id ID of the item to be deleted
 * @param jwtToken 
 */
export async function deleteTodoItem (id: string,
  jwtToken: string)
{
  const userId = parseUserId(jwtToken);
  await todoAccess.deleteTodoItem(id,
    userId);
}