**Daily Tasks system**

*   Implement TypeScript
    
*   Implement ESLint
    
*   Implement Playwright
    
    *   Create Playwright tests
        
    *   Run tests whenever a feature is added/edited and make sure nothing breaks
        
    *   Don’t change a playwright test just to make a feature pass
        
*   Project will run React for frontend
    
*   Project will run Node in the backend
    
*   Project will be deployed to Vercel
    
*   Project will use Turso for the DB
    
    *   DB URL: libsql://daily-tasks-system-devies.aws-eu-west-1.turso.io
        
    *   DB token: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzYxOTAyMTksImlkIjoiMDE5ZDhkMmYtMmUwMS03YzNlLWEzZGQtMjAxNGNhNTQ0NTVmIiwicmlkIjoiZGZmODY2NTAtYTA2NC00NzI2LWIwYmEtNTI0MDkyY2FjY2U0In0.wCp1AqqndVj\_IOEhJmbnZxWEnZNCYxaKOK\_UoG7kFDqsXJqd4DSKNDHzFpoKykncgKz1RpW6GooVERI4mgmSBg
        
*   Create ‘env.local’, env.prod’, and ‘env.example’
    
*   Use JWT
    
*   Add security measures to avoid any exploit of the project, like rate limiting, sanitizing user inputs, and so on
    
*   System behind login
    
    *   User can only see the tasks, if logged in
        
    *   User can only see tasks registered by the same user
        
    *   User can only edit/delete tasks registered by the same user
        
*   First page:
    
    *   Login page requesting username and password
        
*   Second page:
    
    *   If the user is logged in
        
        *   ‘Open calendar’ option
            
            *   When clicked, displays a calendar so the user can opt to see any day oin the past or the future
                
        *   Current date
            
        *   Left arrow to check previous day
            
        *   Right arrow to check next day
            
        *   On the current day:
            
            *   Input field to add task description
                
            *   Input field to add how much time was used for that task (30 min, 1h, 1h and 30 min, 2hrs, and so on)
                
            *   Button ‘add another task’ that creates another task input field with time input field
                
            *   List of the tasks already added to the viewed date
                
                *   Icon on each task to edit or delete it
                    
                *   For deletion, the user must type ‘delete’ into an input and confirm the deletion
                    
                *   For editing the user must click on ‘update’ after making the edits
                    
            *   Summary of the total time spent on the current viewed date
                
        *   When checking a previous date:
            
            *   List of all the tasks and times added previously
                
                *   Icon on each task to edit or delete it
                    
                *   For deletion, the user must type ‘delete’ into an input and confirm the deletion
                    
                *   For editing the user must click on ‘update’ after making the edits
                    
            *   Button ‘add another task’ that creates another task input field with time input field
                
        *   When checking the next date:
            
            *   Input field to add task description
                
            *   Input field to add how much time was used for that task (30 min, 1h, 1h and 30 min, 2hrs, and so on)
                
            *   Button ‘add another task’ that creates another task input field with time input field
                
            *   List of the tasks already added to the viewed date
                
                *   Icon on each task to edit or delete it
                    
                *   For deletion, the user must type ‘delete’ into an input and confirm the deletion
                    
                *   For editing the user must click on ‘update’ after making the edits
                    
            *   Summary of the total time spent on the current viewed date