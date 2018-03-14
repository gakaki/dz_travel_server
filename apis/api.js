"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = (apiClazz) => {
    return (target, name, descriptor) => {
        // let fun = descriptor.value;
        let ctx = descriptor.arguments[0];
        let api = new apiClazz;
        api.parse(ctx.query);
        ctx.api = api;
        api.ctx = ctx;
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBR0EsTUFBTSxDQUFDLE9BQU8sR0FBRyxDQUFDLFFBQXFCLEVBQUMsRUFBRTtJQUN0QyxNQUFNLENBQUMsQ0FBQyxNQUFVLEVBQUUsSUFBVyxFQUFFLFVBQWMsRUFBRSxFQUFFO1FBQy9DLDhCQUE4QjtRQUM5QixJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLElBQUksR0FBRyxHQUFRLElBQUksUUFBUSxDQUFDO1FBQzVCLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ3BCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2QsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbEIsQ0FBQyxDQUFBO0FBQ0wsQ0FBQyxDQUFBIn0=