**Daily Tasks system**

*   Implement TypeScript

*   Implement ESLint

*   Implement Playwright

    *   Create Playwright tests

    *   Run tests whenever a feature is added/edited and make sure nothing breaks

    *   Don't change a playwright test just to make a feature pass

*   Project will run React for frontend

*   Project will run Node in the backend

*   Project will be deployed to Vercel

*   Project will use Turso for the DB

    *   DB URL: libsql://daily-tasks-system-devies.aws-eu-west-1.turso.io

*   Create '.env.local', '.env.prod', and '.env.example'

*   Use JWT

*   Add security measures to avoid any exploit of the project, like rate limiting, sanitizing user inputs, and so on

*   System behind login

    *   User can only see the tasks, if logged in

    *   User can only see tasks registered by the same user

    *   User can only edit/delete tasks registered by the same user

*   First page:

    *   Login page requesting username and password

*   Second page (Dashboard):

    *   If the user is logged in

        *   'Open calendar' option

            *   When clicked, displays a calendar so the user can opt to see any day in the past or the future

        *   Current date

        *   Left arrow to check previous day

        *   Right arrow to check next day

        *   Profile link in the header to navigate to the profile settings page

        *   On the current day:

            *   Input field to add task description

            *   Input field to add how much time was used for that task — accepts a positive whole number of hours (1, 2, 3, etc.); this field is optional

            *   Button 'add another task' that creates another task input field with time input field

            *   For future dates only: optional 'Set reminder' checkbox — visible only when the user has an email address saved in their profile; if checked, an email is sent at 07:00 CET on the day of the task listing all reminder tasks

            *   List of the tasks already added to the viewed date

                *   Icon on each task to edit or delete it

                *   For deletion, the user must type 'delete' into an input and confirm the deletion

                *   For editing the user must click on 'update' after making the edits

            *   Summary of the total time spent on the current viewed date (tasks with no duration contribute 0)

        *   When checking a previous date:

            *   List of all the tasks and times added previously

*   Profile page (/profile):

    *   Accessible from the 'Profile' link in the dashboard header

    *   Allows the user to set or update their email address

    *   Email is used exclusively for daily task reminder emails

*   Email reminders:

    *   Sent via the Resend email API using native fetch (no SDK — avoids ESM conflicts on Vercel CommonJS backend)

    *   Vercel Cron triggers the endpoint daily at 07:00 CET (06:00 UTC)

    *   Only sent to users who have an email set and have at least one task with the reminder enabled for that day

*   PDF export (planned):

    *   Export tasks as a PDF for the current week or month

    *   Available from the dashboard via an 'Export' button
